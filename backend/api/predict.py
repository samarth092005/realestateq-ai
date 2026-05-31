"""
Ames Housing APIRouter for Inference
Author: Senior Machine Learning Engineer & FastAPI Engineer
Date: May 2026
Description: This module defines the prediction route for house price estimation.
             It loads the serialized preprocessor and best XGBoost estimator only once at 
             application startup (module level) and runs the complete preprocessing, prediction, 
             and post-processing flow.
"""

import os
import sys
import logging
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from api.schemas import HousePredictionInput, HousePredictionOutput

# Configure logging specific to this module
logger = logging.getLogger(__name__)

# Dynamic module-level import path injection
# We inject the project root directory into sys.path to successfully resolve
# absolute imports like backend.ml.src.preprocessing.
current_dir = os.path.dirname(os.path.abspath(__file__)) # backend/api
backend_dir = os.path.dirname(current_dir) # backend/
root_dir = os.path.dirname(backend_dir) # c:\Users\Samar\realstateq_AI

if root_dir not in sys.path:
    sys.path.append(root_dir)
    logger.info(f"Dynamically appended project root directory to sys.path: {root_dir}")

try:
    from backend.ml.src.preprocessing import AmesFeatureEngineer
    logger.info("Successfully imported AmesFeatureEngineer transformer.")
    
    # Namespace resolution for pickle deserialization:
    # Since preprocessor.pkl was fit and saved in a script environment (where AmesFeatureEngineer was part of __main__),
    # joblib expects to find it under the __main__ module of the running process. When uvicorn is running, 
    # __main__ is actually uvicorn.__main__. We dynamically inject AmesFeatureEngineer into uvicorn's __main__ 
    # namespace to successfully resolve the deserialization of the preprocessor pipeline.
    import sys
    if '__main__' in sys.modules:
        setattr(sys.modules['__main__'], 'AmesFeatureEngineer', AmesFeatureEngineer)
        logger.info("✓ Dynamically registered AmesFeatureEngineer inside sys.modules['__main__'] namespace.")
except ImportError as e:
    logger.critical(f"Failed to import AmesFeatureEngineer: {e}", exc_info=True)
    raise RuntimeError("Missing AmesFeatureEngineer custom transformer class. Cannot run inference pipeline.")

# 1. Define Model and Preprocessor Paths
preprocessor_path = os.path.join(backend_dir, "ml", "models", "preprocessor.pkl")
best_model_path = os.path.join(backend_dir, "ml", "models", "best_model.pkl")

# 2. Deserialization during module loading (startup)
# This executes exactly once when FastAPI imports the APIRouter.
logger.info("=== Loading serialized ML assets ===")

if not os.path.exists(preprocessor_path):
    logger.critical(f"Preprocessor not found at: {preprocessor_path}")
    raise FileNotFoundError(f"Missing preprocessor pipeline asset: {preprocessor_path}")

if not os.path.exists(best_model_path):
    logger.critical(f"Best model not found at: {best_model_path}")
    raise FileNotFoundError(f"Missing best model estimator asset: {best_model_path}")

try:
    preprocessor = joblib.load(preprocessor_path)
    logger.info("✓ Preprocessor pipeline loaded successfully.")
    
    model = joblib.load(best_model_path)
    logger.info(f"✓ Best model estimator loaded successfully ({type(model).__name__}).")
except Exception as e:
    logger.critical(f"Failed to deserialize ML assets at startup: {e}", exc_info=True)
    raise RuntimeError(f"Error loading ML pipelines: {e}")

# 3. Create FastAPI APIRouter
router = APIRouter()

@router.post("/predict", response_model=HousePredictionOutput, summary="Predict House Sale Price")
def predict_house(payload: HousePredictionInput) -> HousePredictionOutput:
    """
    Predict the selling price of an Ames residential property.
    
    This endpoint executes the following production workflow:
    1. Translates Pydantic schema request payload to a Pandas DataFrame.
    2. Runs feature engineering, median imputation, and standard scaling via `preprocessor.pkl`.
    3. Runs high-precision inference via the `best_model.pkl` XGBoost estimator.
    4. Applies inverse log transformation (`expm1`) to translate prediction back to US Dollars.
    5. Returns formatted response dictionary containing predicted house price.
    """
    try:
        # Convert request body to dictionary, then convert into a single-row DataFrame
        input_data = payload.model_dump(by_alias=True)
        input_df = pd.DataFrame([input_data])
        
        logger.debug(f"Incoming inference features: {input_data}")
        
        # Apply standard preprocessing transformations (AmesFeatureEngineer -> ColumnTransformer)
        preprocessed_features = preprocessor.transform(input_df)
        
        # Inference (returns prediction on log scale)
        log_prediction = model.predict(preprocessed_features)
        
        # Invert log transform (log1p inverse is expm1)
        predicted_price = np.expm1(log_prediction)[0]
        
        # Guard against statistical edge cases yielding negative values (highly improbable)
        predicted_price = float(np.clip(predicted_price, a_min=0, a_max=None))
        
        # Round to 2 decimal places representing cents
        predicted_price = round(predicted_price, 2)
        
        logger.info(f"Successful Prediction: ${predicted_price:,.2f}")
        
        return HousePredictionOutput(predicted_price=predicted_price)
        
    except Exception as e:
        logger.error(f"Prediction Pipeline Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Inference pipeline execution error: {str(e)}"
        )
