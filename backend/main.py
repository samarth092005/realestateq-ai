"""
RealStateQ AI ML Inference Application Entrypoint
Author: Senior Machine Learning Engineer & FastAPI Engineer
Date: May 2026
Description: This script instantiates the FastAPI application, configures CORS middleware, 
             implements the basic health check endpoint, and mounts the inference APIRouter.
"""

import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.predict import router as predict_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 1. Instantiate FastAPI application
app = FastAPI(
    title="RealStateQ AI ML Inference API",
    description="High-performance machine learning inference engine for Ames Housing prices.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 2. Add CORS Middleware to enable seamless consumption by frontend apps
# Adjust allow_origins for production deployment if necessary.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Connect predicting route under the /api prefix
app.include_router(predict_router, prefix="/api", tags=["Machine Learning"])

# 4. Implement Basic Health Check route
@app.get("/health", tags=["System Health"])
def health_check() -> dict:
    """
    Service health check endpoint.
    Used for monitoring service uptime, container orchestration, and load balancing checks.
    """
    logger.info("Service health check called.")
    return {"status": "healthy"}

@app.get("/", tags=["System Info"])
def root() -> dict:
    """
    Root endpoint containing API meta instructions.
    """
    return {
        "message": "Welcome to RealStateQ AI Machine Learning Inference API",
        "documentation": "/docs",
        "health_check": "/health"
    }

# Running Instructions:
# To run this FastAPI application locally, run the following command in terminal:
#     uvicorn main:app --reload
# Or if run from the parent project directory:
#     uvicorn backend.main:app --reload
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting local development server via uvicorn...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
