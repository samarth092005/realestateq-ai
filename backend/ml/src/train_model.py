"""
Ames Housing Model Training and Selection Pipeline
Author: Senior Machine Learning Engineer
Date: May 2026
Description: This script loads the Ames Housing dataset, separates features and the target variable, 
             applies a log transform to the target variable to correct positive skewness, loads 
             the pre-fitted preprocessing pipeline, and splits the data. It then trains and compares 
             three models: Linear Regression, Random Forest Regressor, and XGBoost Regressor.
             Finally, it evaluates the models using MAE, RMSE, and R² on the original price scale,
             selects the best model, and serializes the best model and model metrics.
"""

import os
import sys
import json
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure the current directory is in sys.path so local imports work correctly.
# This ensures that AmesFeatureEngineer custom transformer from preprocessing.py
# can be successfully resolved during preprocessor.pkl deserialization.
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.append(src_dir)

from preprocessing import load_and_clean_data, AmesFeatureEngineer

# Configure logging to console and file
log_dir = os.path.join(os.path.dirname(src_dir), "logs")
os.makedirs(log_dir, exist_ok=True)
log_file_path = os.path.join(log_dir, "training.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file_path, encoding="utf-8")
    ]
)
logger = logging.getLogger(__name__)

# Try to import XGBRegressor, logging an error if not found.
try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logger.warning("XGBoost is not installed. XGBoostRegressor training will be skipped if not available.")


def evaluate_predictions(y_true_log, y_pred_log):
    """
    Evaluates predictions by transforming them back to the original currency scale.
    It computes MAE, RMSE, and R2 score.
    """
    # Inverse transform of log1p(x) is expm1(x) = exp(x) - 1
    y_true = np.expm1(y_true_log)
    y_pred = np.expm1(y_pred_log)
    
    # Handle any potential negative or nan predictions gracefully (highly unlikely with log scaling)
    y_pred = np.clip(y_pred, a_min=0, a_max=None)
    
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    return mae, rmse, r2


def main():
    logger.info("=== Starting Ames Housing Model Training & Selection Pipeline ===")
    
    # Define relative paths
    base_dir = os.path.dirname(src_dir) # backend/ml/
    data_path = os.path.join(base_dir, "data", "train.csv")
    preprocessor_path = os.path.join(base_dir, "models", "preprocessor.pkl")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    best_model_path = os.path.join(models_dir, "best_model.pkl")
    metrics_path = os.path.join(models_dir, "model_metrics.json")
    
    # 1. Load Data with standard row-level cleaning (dropping duplicates and Ames extreme outliers)
    logger.info("Step 1: Loading and cleaning training data...")
    try:
        df = load_and_clean_data(data_path)
    except Exception as e:
        logger.error(f"Failed to load or clean data: {e}")
        sys.exit(1)
        
    # 2. Feature/Target Separation
    logger.info("Step 2: Separating features (X) and target variable (y = SalePrice)...")
    target_col = 'SalePrice'
    if target_col not in df.columns:
        logger.error(f"Target column '{target_col}' not found in the dataset.")
        sys.exit(1)
        
    # Drop 'Id' as it is just an identifier and should not be used as a predictor
    X = df.drop(columns=['Id', target_col], errors='ignore')
    y = df[target_col]
    logger.info(f"Features shape: {X.shape}, Target shape: {y.shape}")
    
    # 3. Target Transformation: Apply log1p transformation to SalePrice
    #
    # THEORETICAL JUSTIFICATION FOR LOG TRANSFORMATION:
    # 1. Positive Skewness Mitigation: SalePrice exhibits a long right tail (skewness). 
    #    Many statistical models assume target homoscedasticity and normally distributed residuals. 
    #    Log transformation compresses high values and expands low values, stabilizing variance 
    #    and converting the distribution into a near-normal shape.
    # 2. Multiplicative vs Additive Relationships: Real estate values tend to scale multiplicatively 
    #    (e.g., adding an extra bedroom increases price by a percentage, rather than a fixed dollar amount). 
    #    Fitting a model on log(SalePrice) naturally models these percentage-based multiplicative effects.
    # 3. Error Penalty Balance: Minimizing Mean Squared Error on log-prices corresponds mathematically 
    #    to minimizing Mean Absolute Percentage Error (MAPE) on original prices. It prevents the loss 
    #    function from being dominated by high-end, luxury property prediction errors.
    logger.info("Step 3: Applying log1p transformation to SalePrice target variable...")
    y_log = np.log1p(y)
    
    # 4. Load and use the preprocessor.pkl pipeline
    logger.info(f"Step 4: Loading preprocessor pipeline from {preprocessor_path}...")
    if not os.path.exists(preprocessor_path):
        logger.error(f"Preprocessor file not found at {preprocessor_path}. Make sure preprocessing.py has been run.")
        sys.exit(1)
        
    try:
        preprocessor = joblib.load(preprocessor_path)
        logger.info("Preprocessor pipeline successfully loaded!")
    except Exception as e:
        logger.error(f"Failed to deserialize preprocessor: {e}")
        sys.exit(1)
        
    # 5. Data Splitting: 80/20 train/validation split
    logger.info("Step 5: Partitioning data into train and validation sets (80/20 split)...")
    X_train_raw, X_val_raw, y_train, y_val = train_test_split(
        X, y_log, test_size=0.2, random_state=42
    )
    logger.info(f"Train split size: {X_train_raw.shape[0]}, Validation split size: {X_val_raw.shape[0]}")
    
    # Apply fitted preprocessor to train and validation sets
    logger.info("Applying loaded preprocessor pipeline transformations...")
    try:
        X_train = preprocessor.transform(X_train_raw)
        X_val = preprocessor.transform(X_val_raw)
        logger.info(f"Transformed features dimension - Train: {X_train.shape}, Validation: {X_val.shape}")
    except Exception as e:
        logger.error(f"Failed to transform data through preprocessing pipeline: {e}")
        sys.exit(1)
        
    # 6. Model Training & Comparison Setup
    #
    # RATIONALE BEHIND MODEL SELECTION & THEIR STRENGTHS/WEAKNESSES:
    # 
    # Model 1: LinearRegression
    # - Why Selected: Serves as the classic parametric baseline. Highly interpretable and fast to train.
    # - Strengths: Extremely fast, simple, no hyperparameter tuning needed, provides clear coefficients 
    #   for feature impact. Excellent when relationships are linear and features are scaled.
    # - Weaknesses: Highly sensitive to outliers (handled partly by cleaning), assumes strict linearity, 
    #   struggles with complex non-linear feature interactions, and prone to high bias.
    #
    # Model 2: RandomForestRegressor
    # - Why Selected: A robust bagging ensemble of decision trees. Captures complex non-linear relationships.
    # - Strengths: Highly resistant to overfitting (due to averaging bootstrap samples), handles high-dimensional 
    #   feature spaces well, captures non-linear interactions automatically, and requires minimal tuning.
    # - Weaknesses: Prone to large memory footprints, cannot extrapolate beyond training bounds (makes it poor 
    #   at predicting historical anomalies or extreme future values), and slow to run inference on massive sets.
    #
    # Model 3: XGBRegressor (Extreme Gradient Boosting)
    # - Why Selected: State-of-the-art boosting ensemble. The industry standard for tabular datasets.
    # - Strengths: Outstanding predictive performance, utilizes regularized boosting to control overfitting, 
    #   built-in handling of missing values, incredibly fast execution via parallel tree building, and highly tunable.
    # - Weaknesses: Highly sensitive to hyperparameter configurations (needs careful tuning), prone to overfitting 
    #   if learning rate is too high or estimators too numerous, and acts as a "black box" compared to linear regression.
    
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)
    }
    
    if XGBOOST_AVAILABLE:
        models["XGBoost Regressor"] = XGBRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
    else:
        logger.warning("Skipping XGBoost Regressor training since the package is not installed.")
        
    results = {}
    trained_estimators = {}
    
    logger.info("Step 6: Training and evaluating models...")
    for model_name, model in models.items():
        logger.info(f"--- Training {model_name} ---")
        try:
            model.fit(X_train, y_train)
            trained_estimators[model_name] = model
            
            # Predict
            y_train_pred = model.predict(X_train)
            y_val_pred = model.predict(X_val)
            
            # Evaluate on original currency scale (expm1)
            train_mae, train_rmse, train_r2 = evaluate_predictions(y_train, y_train_pred)
            val_mae, val_rmse, val_r2 = evaluate_predictions(y_val, y_val_pred)
            
            results[model_name] = {
                "Train_MAE": float(train_mae),
                "Train_RMSE": float(train_rmse),
                "Train_R2": float(train_r2),
                "Val_MAE": float(val_mae),
                "Val_RMSE": float(val_rmse),
                "Val_R2": float(val_r2)
            }
            
            logger.info(f"{model_name} Training Performance:")
            logger.info(f"  Train MAE:  ${train_mae:,.2f}  |  Val MAE:  ${val_mae:,.2f}")
            logger.info(f"  Train RMSE: ${train_rmse:,.2f}  |  Val RMSE: ${val_rmse:,.2f}")
            logger.info(f"  Train R²:   {train_r2:.4f}     |  Val R²:   {val_r2:.4f}")
            
        except Exception as e:
            logger.error(f"Error training {model_name}: {e}", exc_info=True)
            
    # 8. Create Model Comparison Table
    logger.info("\n=== Step 8: Model Comparison Summary ===")
    comparison_df = pd.DataFrame(results).T
    comparison_df = comparison_df[["Train_MAE", "Val_MAE", "Train_RMSE", "Val_RMSE", "Train_R2", "Val_R2"]]
    
    # Format comparison table for CLI output
    formatted_comparison = comparison_df.copy()
    formatted_comparison["Train_MAE"] = formatted_comparison["Train_MAE"].map(lambda x: f"${x:,.2f}")
    formatted_comparison["Val_MAE"] = formatted_comparison["Val_MAE"].map(lambda x: f"${x:,.2f}")
    formatted_comparison["Train_RMSE"] = formatted_comparison["Train_RMSE"].map(lambda x: f"${x:,.2f}")
    formatted_comparison["Val_RMSE"] = formatted_comparison["Val_RMSE"].map(lambda x: f"${x:,.2f}")
    formatted_comparison["Train_R2"] = formatted_comparison["Train_R2"].map(lambda x: f"{x:.4f}")
    formatted_comparison["Val_R2"] = formatted_comparison["Val_R2"].map(lambda x: f"{x:.4f}")
    
    logger.info("\n" + formatted_comparison.to_string())
    
    # 9. Select the Best Performing Model (based on lowest Validation RMSE)
    logger.info("\nStep 9: Selecting the best performing model based on lowest Validation RMSE...")
    best_model_name = comparison_df["Val_RMSE"].idxmin()
    best_val_rmse = comparison_df.loc[best_model_name, "Val_RMSE"]
    best_val_r2 = comparison_df.loc[best_model_name, "Val_R2"]
    
    logger.info(f"Selected Best Model: {best_model_name}")
    logger.info(f"Best Validation RMSE: ${best_val_rmse:,.2f}")
    logger.info(f"Best Validation R²: {best_val_r2:.4f}")
    
    best_estimator = trained_estimators[best_model_name]
    
    # 10. Save the Best Performing Model to disk
    logger.info(f"Step 10: Serializing selected {best_model_name} to {best_model_path}...")
    try:
        joblib.dump(best_estimator, best_model_path)
        logger.info("Best model serialized successfully!")
    except Exception as e:
        logger.error(f"Failed to serialize best model: {e}")
        sys.exit(1)
        
    # 11. Save model comparison metrics to json file
    logger.info(f"Step 11: Exporting all model metrics to {metrics_path}...")
    metrics_export = {
        "best_model": {
            "name": best_model_name,
            "validation_rmse": best_val_rmse,
            "validation_r2": best_val_r2,
        },
        "all_models": results
    }
    
    try:
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics_export, f, indent=4)
        logger.info("Model metrics successfully exported!")
    except Exception as e:
        logger.error(f"Failed to write model metrics JSON: {e}")
        
    logger.info("\n=== Ames Housing Model Training & Selection Completed Successfully! ===")
    logger.info(f"Logs written to: {log_file_path}")


if __name__ == '__main__':
    main()
