from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import verify_internal_api_key


router = APIRouter(
    prefix="/api/fraud-detection",
    tags=["Fraud Detection"],
    dependencies=[Depends(verify_internal_api_key)],
)


class FraudAnalysisRequest(BaseModel):
    property_id: str = Field(default="", max_length=100)
    title: str = Field(min_length=5, max_length=150)
    description: str = Field(default="", max_length=3000)

    price: float = Field(gt=0)
    area_sqft: float = Field(gt=0)

    ai_predicted_price: float | None = Field(default=None, gt=0)
    market_median_price_per_sqft: float | None = Field(
        default=None, gt=0
    )

    owner_listings_today: int = Field(default=0, ge=0)
    max_listings_per_day: int = Field(default=10, ge=1)
    price_deviation_threshold_percent: float = Field(
        default=60, ge=0, le=1000
    )


def analyse_fraud_risk(data: FraudAnalysisRequest):
    score = 0
    signals = []

    # RULE 1: Price deviation from AI prediction.
    deviation_percent = None

    if data.ai_predicted_price is not None:
        deviation_percent = (
            abs(data.price - data.ai_predicted_price)
            / data.ai_predicted_price
        ) * 100

        threshold = data.price_deviation_threshold_percent

        if deviation_percent >= threshold * 2:
            score += 60
            signals.append({
                "type": "extreme_price_deviation",
                "points": 60,
                "message": (
                    f"Listing price deviates {deviation_percent:.1f}% "
                    "from the AI estimated price."
                ),
            })

        elif deviation_percent >= threshold * 1.5:
            score += 45
            signals.append({
                "type": "high_price_deviation",
                "points": 45,
                "message": (
                    f"Listing price deviates {deviation_percent:.1f}% "
                    "from the AI estimated price."
                ),
            })

        elif deviation_percent > threshold:
            score += 30
            signals.append({
                "type": "price_deviation",
                "points": 30,
                "message": (
                    f"Listing price deviates {deviation_percent:.1f}% "
                    f"from the configured {threshold:.1f}% threshold."
                ),
            })

    # RULE 2: Unusually high seller listing volume.
    if data.owner_listings_today > data.max_listings_per_day:
        if data.owner_listings_today > data.max_listings_per_day * 2:
            points = 40
        else:
            points = 25

        score += points
        signals.append({
            "type": "excessive_listing_volume",
            "points": points,
            "message": (
                f"Seller has posted {data.owner_listings_today} listings "
                f"today. Configured limit: {data.max_listings_per_day}."
            ),
        })

    # RULE 3: Unusual price per square foot.
    if data.market_median_price_per_sqft is not None:
        price_per_sqft = data.price / data.area_sqft
        median = data.market_median_price_per_sqft
        ratio = price_per_sqft / median

        if ratio >= 2.5 or ratio <= 0.25:
            score += 20
            signals.append({
                "type": "unusual_price_per_sqft",
                "points": 20,
                "message": (
                    f"Listing price per sqft (₹{price_per_sqft:.2f}) "
                    "is significantly different from the supplied "
                    f"market benchmark (₹{median:.2f})."
                ),
            })

    # RULE 4: Incomplete description.
    if len(data.description.strip()) < 30:
        score += 5
        signals.append({
            "type": "incomplete_description",
            "points": 5,
            "message": "Property description contains very little detail.",
        })

    score = min(score, 100)

    if score >= 70:
        severity = "high"
        recommendation = "Prioritise manual admin investigation."
    elif score >= 40:
        severity = "medium"
        recommendation = "Review the listing and verify its details."
    else:
        severity = "low"
        recommendation = "No immediate action; continue routine monitoring."

    return {
        "property_id": data.property_id,
        "risk_score": score,
        "severity": severity,
        "is_suspicious": score >= 40,
        "signals": signals,
        "price_deviation_percent": (
            round(deviation_percent, 2)
            if deviation_percent is not None else None
        ),
        "recommendation": recommendation,
        "engine": "landestatex_explainable_fraud_rules",
        "data_quality": "rule_based_heuristic",
        "disclaimer": (
            "This is an automated risk assessment, not proof of fraud. "
            "Admin review is required before taking action."
        ),
    }


@router.post("/analyze/")
def analyze_property_fraud(request: FraudAnalysisRequest):
    return {
        "success": True,
        "message": "Property fraud risk analysis completed.",
        "data": analyse_fraud_risk(request),
    }
