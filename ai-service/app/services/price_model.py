
from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "app" / "models" / "price_model.joblib"

_model = None


def load_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at: {MODEL_PATH}. "
                "Run: python -m app.training.train_price_model"
            )

        _model = joblib.load(MODEL_PATH)

    return _model


def predict_property_price(property_data: dict) -> float:
    model = load_model()

    row = pd.DataFrame(
        [
            {
                "area_sqft": property_data["area_sqft"],
                "bedrooms": property_data.get("bedrooms", 0),
                "bathrooms": property_data.get("bathrooms", 0),
                "property_type": property_data["property_type"].strip().lower(),
                "listing_type": property_data["listing_type"].strip().lower(),
                "city": property_data["city"].strip().lower(),
                "locality": property_data.get("locality", "").strip().lower(),
            }
        ]
    )

    prediction = model.predict(row)[0]

    return round(max(0.0, float(prediction)), 2)
