from __future__ import annotations

from pathlib import Path
from typing import Any
import os

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from .model import MODEL_PATH, train_model
except ImportError:
    from model import MODEL_PATH, train_model


app = FastAPI(title="CompIQ Salary Predictor", version="1.0.0")

frontend_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_ORIGIN", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in frontend_origins if origin],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionInput(BaseModel):
    role: str
    level: str
    company: str
    location: str
    years_of_experience: float = Field(ge=0, le=50)


class PredictionOutput(BaseModel):
    predicted_base: int
    predicted_bonus: int
    predicted_equity: int
    predicted_total_comp: int
    confidence_score: float
    percentile: int
    prediction_currency: str = "USD"
    market: str = "Global / overseas market"


def load_artifact() -> dict[str, Any]:
    if not Path(MODEL_PATH).exists():
        train_model()
    return joblib.load(MODEL_PATH)


ARTIFACT = load_artifact()

INDIAN_COMPANIES = {"Infosys", "TCS", "Wipro"}
INDIA_LOCATION_TERMS = {
    "india",
    "bangalore",
    "bengaluru",
    "delhi",
    "new delhi",
    "mumbai",
    "pune",
    "hyderabad",
    "chennai",
    "gurgaon",
    "gurugram",
    "noida",
    "kolkata",
    "calcutta",
    "ahmedabad",
    "surat",
    "vadodara",
    "baroda",
    "jaipur",
    "lucknow",
    "kanpur",
    "nagpur",
    "indore",
    "bhopal",
    "coimbatore",
    "kochi",
    "cochin",
    "trivandrum",
    "thiruvananthapuram",
    "visakhapatnam",
    "vizag",
    "vijayawada",
    "bhubaneswar",
    "chandigarh",
    "mohali",
    "patna",
    "ranchi",
    "guwahati",
    "mysore",
    "mysuru",
    "mangalore",
    "mangaluru",
    "nashik",
    "thane",
    "faridabad",
    "ghaziabad",
    "kerala",
    "karnataka",
    "maharashtra",
    "tamil nadu",
    "telangana",
    "andhra pradesh",
    "uttar pradesh",
    "gujarat",
    "rajasthan",
    "madhya pradesh",
    "west bengal",
    "odisha",
    "punjab",
    "haryana",
    "bihar",
    "jharkhand",
    "assam",
    "goa",
}

INDIA_BIG_TECH_TC = {
    "Junior": 2_400_000,
    "Mid": 3_800_000,
    "Senior": 6_200_000,
    "Staff": 10_500_000,
    "Principal": 15_500_000,
}

INDIA_SERVICE_TC = {
    "Junior": 450_000,
    "Mid": 850_000,
    "Senior": 1_500_000,
    "Staff": 2_400_000,
    "Principal": 3_600_000,
}

INDIA_STARTUP_TC = {
    "Junior": 1_800_000,
    "Mid": 3_200_000,
    "Senior": 5_500_000,
    "Staff": 8_800_000,
    "Principal": 12_500_000,
}


def is_indian_market(company: str, location: str) -> bool:
    normalized_location = location.strip().lower()
    return company in INDIAN_COMPANIES or any(term in normalized_location for term in INDIA_LOCATION_TERMS)


def india_local_prediction(payload: PredictionInput) -> tuple[int, int, int, int, int]:
    if payload.company in INDIAN_COMPANIES:
        level_table = INDIA_SERVICE_TC
        company_multiplier = {"Infosys": 1.05, "TCS": 0.98, "Wipro": 0.96}.get(payload.company, 1.0)
        equity_rate = 0.02
        bonus_rate = 0.08
    elif payload.company in {"Stripe", "Netflix", "Uber"}:
        level_table = INDIA_STARTUP_TC
        company_multiplier = {"Stripe": 1.16, "Netflix": 1.12, "Uber": 1.0}.get(payload.company, 1.0)
        equity_rate = 0.22
        bonus_rate = 0.10
    else:
        level_table = INDIA_BIG_TECH_TC
        company_multiplier = {
            "Google": 1.12,
            "Meta": 1.15,
            "Amazon": 0.92,
            "Microsoft": 0.96,
            "Apple": 1.04,
        }.get(payload.company, 1.0)
        equity_rate = 0.18
        bonus_rate = 0.11

    role_multiplier = {
        "Software Engineer": 1.0,
        "Senior SWE": 1.08,
        "Staff SWE": 1.18,
        "Data Scientist": 1.04,
        "Product Manager": 1.08,
        "PM": 1.08,
        "DevOps": 0.94,
    }.get(payload.role, 1.0)

    expected_yoe = {"Junior": 1, "Mid": 3, "Senior": 6, "Staff": 9, "Principal": 13}.get(payload.level, 4)
    yoe_gap = max(min(payload.years_of_experience - expected_yoe, 4), -5)
    experience_multiplier = max(0.72, 1 + yoe_gap * 0.045)

    location_multiplier = 1.0
    normalized_location = payload.location.strip().lower()
    if any(city in normalized_location for city in ["mumbai", "bangalore", "bengaluru", "hyderabad", "pune", "gurgaon", "gurugram", "noida"]):
        location_multiplier = 1.06
    elif any(city in normalized_location for city in ["delhi", "chennai", "kolkata", "ahmedabad", "jaipur", "coimbatore", "kochi"]):
        location_multiplier = 0.98

    total_comp = int(round(
        level_table.get(payload.level, level_table["Mid"])
        * company_multiplier
        * role_multiplier
        * experience_multiplier
        * location_multiplier,
        -4,
    ))
    bonus = int(round(total_comp * bonus_rate, -4))
    equity = int(round(total_comp * equity_rate, -4))
    base = max(total_comp - bonus - equity, 0)

    india_reference = np.array(list(INDIA_SERVICE_TC.values()) + list(INDIA_STARTUP_TC.values()) + list(INDIA_BIG_TECH_TC.values()))
    percentile = int(round((india_reference < total_comp).mean() * 100))
    return base, bonus, equity, total_comp, percentile


@app.get("/health")
@app.get("/api/ml_predict/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": ARTIFACT.get("model") is not None,
        "training_samples": len(ARTIFACT.get("training_data", [])),
        "score": ARTIFACT.get("score"),
    }


@app.post("/predict", response_model=PredictionOutput)
@app.post("/api/ml_predict", response_model=PredictionOutput)
@app.post("/api/ml_predict/predict", response_model=PredictionOutput)
def predict(payload: PredictionInput) -> PredictionOutput:
    try:
        model = ARTIFACT["model"]
        training_data = ARTIFACT["training_data"]

        input_frame = pd.DataFrame(
            [
                {
                    "company": payload.company,
                    "role": payload.role,
                    "level": payload.level,
                    "location": payload.location,
                    "yoe": payload.years_of_experience,
                }
            ]
        )

        prediction = model.predict(input_frame)[0]
        predicted_base, predicted_bonus, predicted_equity, predicted_total_comp = [
            max(0, int(round(value))) for value in prediction
        ]

        forest = model.named_steps["regressor"]
        transformed_input = model.named_steps["preprocessor"].transform(input_frame)
        tree_totals = np.array([tree.predict(transformed_input)[0][3] for tree in forest.estimators_])
        relative_std = float(np.std(tree_totals) / max(np.mean(tree_totals), 1))
        confidence_score = round(float(np.clip(1 - relative_std, 0.62, 0.96)), 2)

        market_totals = training_data["annual_total_comp"].to_numpy()
        percentile = int(round((market_totals < predicted_total_comp).mean() * 100))
        prediction_currency = "USD"
        market = "Global / overseas market"

        if is_indian_market(payload.company, payload.location):
            predicted_base, predicted_bonus, predicted_equity, predicted_total_comp, percentile = india_local_prediction(payload)
            prediction_currency = "INR"
            market = "India local market"
            confidence_score = max(confidence_score - 0.04, 0.66)

        return PredictionOutput(
            predicted_base=predicted_base,
            predicted_bonus=predicted_bonus,
            predicted_equity=predicted_equity,
            predicted_total_comp=predicted_total_comp,
            confidence_score=confidence_score,
            percentile=percentile,
            prediction_currency=prediction_currency,
            market=market,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to generate salary prediction") from exc
