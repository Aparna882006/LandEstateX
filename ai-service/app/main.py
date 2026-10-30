from fastapi import FastAPI
from app.api.price_prediction import router as price_prediction_router

app = FastAPI(
    title="LandEstateX AI Service",
    description="AI service for LandEstateX",
    version="1.0.0",
)

app.include_router(price_prediction_router)


@app.get("/")
def read_root():
    return {
        "message": "LandEstateX AI service is alive"
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }