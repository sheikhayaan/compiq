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


def load_artifact() -> dict[str, Any]:
    if not Path(MODEL_PATH).exists():
        train_model()
    return joblib.load(MODEL_PATH)


ARTIFACT = load_artifact()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": ARTIFACT.get("model") is not None,
        "training_samples": len(ARTIFACT.get("training_data", [])),
        "score": ARTIFACT.get("score"),
    }


@app.post("/predict", response_model=PredictionOutput)
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

        return PredictionOutput(
            predicted_base=predicted_base,
            predicted_bonus=predicted_bonus,
            predicted_equity=predicted_equity,
            predicted_total_comp=predicted_total_comp,
            confidence_score=confidence_score,
            percentile=percentile,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to generate salary prediction") from exc
