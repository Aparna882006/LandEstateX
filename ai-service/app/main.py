
from fastapi import FastAPI

from app.api.price_prediction import router as price_prediction_router
from app.api.recommendation import router as recommendation_router
from app.api.image_valuation import router as image_valuation_router
from app.api.chatbot import router as chatbot_router
from app.api.fraud_detection import router as fraud_detection_router
from app.api.investment_analytics import router as investment_analytics_router


app = FastAPI(
    title="LandEstateX AI Service",
    description="AI service for LandEstateX",
    version="1.0.0",
)

# ---------------------------------------------
# EXISTING AI MODULES
# ---------------------------------------------
app.include_router(price_prediction_router)
app.include_router(recommendation_router)
app.include_router(image_valuation_router)
app.include_router(chatbot_router)

# ---------------------------------------------
# AI INVESTMENT ANALYTICS
# ---------------------------------------------
app.include_router(investment_analytics_router)

# ---------------------------------------------
# AI FRAUD DETECTION
# ---------------------------------------------
app.include_router(fraud_detection_router)


# ---------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "LandEstateX AI service is alive"
    }


# ---------------------------------------------
# HEALTH CHECK
# ---------------------------------------------
@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }
