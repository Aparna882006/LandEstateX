
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "data" / "property_prices.csv"
MODEL_DIR = BASE_DIR / "app" / "models"
MODEL_PATH = MODEL_DIR / "price_model.joblib"

NUMERIC_FEATURES = ["area_sqft", "bedrooms", "bathrooms"]

CATEGORICAL_FEATURES = [
    "property_type",
    "listing_type",
    "city",
    "locality",
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "price"


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [TARGET]
    missing = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(f"Missing CSV columns: {missing}")

    df = df.dropna(subset=required_columns).copy()

    if len(df) < 10:
        raise ValueError("At least 10 valid rows are required.")

    if (df["price"] <= 0).any() or (df["area_sqft"] <= 0).any():
        raise ValueError("Price and area must be greater than zero.")

    for column in CATEGORICAL_FEATURES:
        df[column] = df[column].astype(str).str.strip().str.lower()

    X = df[FEATURES]
    y = df[TARGET]

    preprocessing = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessing", preprocessing),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=200,
                    random_state=42,
                ),
            ),
        ]
    )

    model.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Training rows: {len(df)}")
    print(f"Model saved successfully: {MODEL_PATH}")
    print("WARNING: This is a demo model trained on synthetic data.")


if __name__ == "__main__":
    main()
