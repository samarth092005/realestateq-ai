"""
Ames Housing Preprocessing Pipeline
Author: Senior Data Scientist
Date: May 2026
Description: Reusable, production-ready preprocessing pipeline for Ames Housing prediction.
             Integrates row-level outlier removal and duplicate check, custom feature
             engineering transformer, imputation, encoding, and scaling in a unified
             scikit-learn Pipeline.
"""

import os
import datetime
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

class AmesFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom scikit-learn transformer for feature engineering on the Ames Housing dataset.
    This class is fully serializable and integrates cleanly into a scikit-learn Pipeline,
    ensuring that the exact same feature transformations are applied to raw training and 
    inference data.
    """
    def __init__(self, current_year=None):
        self.current_year = current_year if current_year is not None else datetime.datetime.now().year

    def fit(self, X, y=None):
        # Feature engineering is a stateless operation, no fitting required.
        return self

    def transform(self, X):
        """
        Applies feature engineering calculations to the input DataFrame.
        """
        # Ensure we do not modify the original DataFrame in-place (avoid side-effects)
        X = X.copy()
        
        # 1. HouseAge: How old is the property from the current year
        X['HouseAge'] = self.current_year - X['YearBuilt']
        
        # 2. RemodelAge: Years elapsed since the last remodel/addition
        X['RemodelAge'] = self.current_year - X['YearRemodAdd']
        
        # 3. TotalBathrooms: Unified bathroom count combining full and half baths
        # BsmtHalfBath and HalfBath are given 0.5 weight as they lack showers.
        X['TotalBathrooms'] = (
            X['FullBath'] + 
            0.5 * X['HalfBath'] + 
            X['BsmtFullBath'] + 
            0.5 * X['BsmtHalfBath']
        )
        
        # 4. TotalPorchArea: Sum of all porch and deck areas
        X['TotalPorchArea'] = (
            X['OpenPorchSF'] + 
            X['EnclosedPorch'] + 
            X['3SsnPorch'] + 
            X['ScreenPorch']
        )
        
        # 5. TotalLivingArea: Above-ground living area combined with total basement area
        X['TotalLivingArea'] = X['GrLivArea'] + X['TotalBsmtSF']
        
        return X

def load_and_clean_data(file_path):
    """
    Loads raw housing data, checks for duplicates, and removes extreme outliers.
    Row-level cleaning is done before pipeline fitting as sklearn pipelines do not drop rows.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Data file not found at {file_path}")
        
    logger.info(f"Loading data from {file_path}")
    df = pd.read_csv(file_path)
    logger.info(f"Loaded raw dataset with shape: {df.shape}")
    
    # 1. Duplicate Removal
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        logger.warning(f"Found {duplicates} duplicate rows. Removing them.")
        df = df.drop_duplicates()
        logger.info(f"Shape after duplicate removal: {df.shape}")
    else:
        logger.info("No duplicate rows found.")
        
    # 2. Outlier Treatment (Dean De Cock's recommendations for Ames Housing)
    # Remove properties with > 4,000 sq ft above-ground living area selling for under $300k.
    # These represent agricultural/unusual properties that violate normal market trends.
    outlier_mask = (df['GrLivArea'] > 4000) & (df['SalePrice'] < 300000)
    outlier_count = outlier_mask.sum()
    if outlier_count > 0:
        logger.info(f"Removing {outlier_count} extreme Ames outliers (GrLivArea > 4000 and SalePrice < $300,000)")
        df = df[~outlier_mask].reset_index(drop=True)
        logger.info(f"Shape after outlier removal: {df.shape}")
    else:
        logger.info("No extreme outliers matching filter found.")
        
    return df

def build_preprocessing_pipeline(numerical_cols, categorical_cols):
    """
    Builds the unified sklearn preprocessing pipeline.
    """
    logger.info("Constructing sklearn preprocessing pipeline...")
    
    # Numerical Preprocessing: Median Imputation + Standard Scaling
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical Preprocessing: Most Frequent Imputation + One-Hot Encoding
    # handle_unknown='ignore' handles unseen categories gracefully during inference.
    # sparse_output=False is used in modern sklearn to get a dense array.
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Column Transformer to apply specific transformations to their respective columns
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_pipeline, numerical_cols),
        ('cat', cat_pipeline, categorical_cols)
    ])
    
    # Unified Pipeline: Feature Engineer -> Column Transformer
    full_pipeline = Pipeline([
        ('engineer', AmesFeatureEngineer()),
        ('preprocessor', preprocessor)
    ])
    
    return full_pipeline

def main():
    # Define relative paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "train.csv")
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)
    model_output_path = os.path.join(model_dir, "preprocessor.pkl")
    
    # Load and clean data
    df = load_and_clean_data(data_path)
    
    # Separate features and target
    target_col = 'SalePrice'
    X = df.drop(columns=['Id', target_col])
    y = df[target_col]
    
    # Base columns before feature engineering
    base_numerical_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = X.select_dtypes(exclude=[np.number]).columns.tolist()
    
    # The engineered features will be created as numerical columns
    engineered_cols = ['HouseAge', 'RemodelAge', 'TotalBathrooms', 'TotalPorchArea', 'TotalLivingArea']
    
    # Combine original numerical features and new engineered features
    # Standard scaling and median imputation will be applied to both groups
    all_numerical_cols = base_numerical_cols + engineered_cols
    
    logger.info(f"Number of base numerical features: {len(base_numerical_cols)}")
    logger.info(f"Number of categorical features: {len(categorical_cols)}")
    logger.info(f"Number of engineered numerical features: {len(engineered_cols)}")
    logger.info(f"Total features for scaling/imputing: {len(all_numerical_cols) + len(categorical_cols)}")
    
    # Build full pipeline
    pipeline = build_preprocessing_pipeline(all_numerical_cols, categorical_cols)
    
    # Fit the pipeline on X
    logger.info("Fitting the preprocessing pipeline on training features...")
    pipeline.fit(X)
    logger.info("Preprocessing pipeline successfully fitted!")
    
    # Save the preprocessing pipeline to disk
    logger.info(f"Serializing pipeline to {model_output_path} using joblib...")
    joblib.dump(pipeline, model_output_path)
    logger.info("Serialization complete!")

if __name__ == '__main__':
    main()
