"""
Prediction Pipeline Verification Tool
Author: Senior Machine Learning Engineer
Date: May 2026
Description: This script verifies that the saved preprocessor and model can be successfully 
             deserialized and used end-to-end for running predictions on real raw data rows.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd

# Configure stdout encoding to ensure no console print issues on Windows
sys.stdout.reconfigure(encoding="utf-8")

# Ensure the current directory is in sys.path so local imports work correctly
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.append(src_dir)

from preprocessing import load_and_clean_data, AmesFeatureEngineer

def verify_pipeline():
    print("=== Ames Housing Prediction Pipeline Verification ===")
    
    # 1. Paths
    base_dir = os.path.dirname(src_dir) # backend/ml
    data_path = os.path.join(base_dir, "data", "train.csv")
    preprocessor_path = os.path.join(base_dir, "models", "preprocessor.pkl")
    best_model_path = os.path.join(base_dir, "models", "best_model.pkl")
    
    # 2. Verify files exist
    for path in [data_path, preprocessor_path, best_model_path]:
        if not os.path.exists(path):
            print(f"ERROR: Required path does not exist: {path}")
            return False
            
    print("✓ All required files exist.")
    
    # 3. Load preprocessing pipeline and best model
    print("Loading preprocessor and model...")
    try:
        preprocessor = joblib.load(preprocessor_path)
        print("✓ Preprocessor pipeline loaded successfully.")
    except Exception as e:
        print(f"ERROR: Failed to load preprocessor: {e}")
        return False
        
    try:
        model = joblib.load(best_model_path)
        print(f"✓ Trained model loaded successfully ({type(model).__name__}).")
    except Exception as e:
        print(f"ERROR: Failed to load model: {e}")
        return False
        
    # 4. Load a test observation from the dataset
    print("Loading sample observation from train.csv...")
    try:
        # Load raw data and take the first row
        df = pd.read_csv(data_path)
        sample_row = df.iloc[[0]].copy()
        
        actual_price = sample_row['SalePrice'].values[0]
        
        # Prepare inputs exactly as expected by the preprocessing pipeline
        # (Drop Id and target column SalePrice)
        sample_features = sample_row.drop(columns=['Id', 'SalePrice'], errors='ignore')
        
        print(f"✓ Loaded sample observation (ID: {sample_row['Id'].values[0]}).")
        print(f"  Actual sale price: ${actual_price:,.2f}")
    except Exception as e:
        print(f"ERROR: Failed to load sample row: {e}")
        return False
        
    # 5. Transform through preprocessing pipeline
    print("Transforming sample features through preprocessor...")
    try:
        preprocessed_features = preprocessor.transform(sample_features)
        print(f"✓ Features preprocessed. Transformed shape: {preprocessed_features.shape}")
    except Exception as e:
        print(f"ERROR: Preprocessing transformation failed: {e}")
        return False
        
    # 6. Run prediction
    print("Running model prediction...")
    try:
        log_pred = model.predict(preprocessed_features)
        
        # The model predicts on log scale. Invert using expm1 to get original USD scale.
        predicted_price = np.expm1(log_pred)[0]
        
        print("\n================ Prediction Results ================")
        print(f"Actual Sale Price:    ${actual_price:,.2f}")
        print(f"Predicted Sale Price: ${predicted_price:,.2f}")
        
        absolute_error = abs(actual_price - predicted_price)
        percentage_error = (absolute_error / actual_price) * 100
        
        print(f"Absolute Error:       ${absolute_error:,.2f}")
        print(f"Percentage Error:     {percentage_error:.2f}%")
        print("====================================================")
        
        if percentage_error < 15:
            print("✓ Prediction pipeline operates flawlessly and delivers high accuracy!")
            return True
        else:
            print("⚠ Prediction ran successfully, but error is higher than expected. Check scaling.")
            return True
            
    except Exception as e:
        print(f"ERROR: Model prediction failed: {e}")
        return False

if __name__ == "__main__":
    success = verify_pipeline()
    sys.exit(0 if success else 1)