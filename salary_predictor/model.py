from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


MODEL_PATH = Path(__file__).with_name("model.pkl")
RANDOM_SEED = 42

COMPANIES = {
    "Google": 1.18,
    "Meta": 1.22,
    "Amazon": 1.02,
    "Microsoft": 1.0,
    "Apple": 1.12,
    "Stripe": 1.2,
    "Netflix": 1.28,
    "Uber": 1.08,
    "Infosys": 0.34,
    "TCS": 0.32,
    "Wipro": 0.31,
}

ROLES = {
    "Software Engineer": 1.0,
    "Senior SWE": 1.12,
    "Staff SWE": 1.34,
    "Data Scientist": 1.06,
    "Product Manager": 1.08,
    "PM": 1.08,
    "DevOps": 0.98,
}

LEVELS = {
    "Junior": {"multiplier": 0.58, "yoe": 1},
    "Mid": {"multiplier": 0.82, "yoe": 3},
    "Senior": {"multiplier": 1.08, "yoe": 6},
    "Staff": {"multiplier": 1.45, "yoe": 9},
    "Principal": {"multiplier": 1.85, "yoe": 13},
}

LOCATIONS = {
    "San Francisco": 1.28,
    "New York": 1.18,
    "Seattle": 1.08,
    "Bangalore": 0.42,
    "Delhi": 0.36,
    "London": 0.88,
    "Remote": 0.82,
}


def generate_training_data(sample_count: int = 300) -> pd.DataFrame:
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    company_names = list(COMPANIES)
    role_names = list(ROLES)
    level_names = list(LEVELS)
    location_names = list(LOCATIONS)

    for index in range(sample_count):
        company = company_names[index % len(company_names)]
        role = role_names[(index * 3 + rng.integers(0, len(role_names))) % len(role_names)]
        level = level_names[(index * 5 + rng.integers(0, len(level_names))) % len(level_names)]
        location = location_names[(index * 7 + rng.integers(0, len(location_names))) % len(location_names)]

        level_info = LEVELS[level]
        expected_yoe = level_info["yoe"]
        yoe = int(np.clip(round(rng.normal(expected_yoe, 1.8)), 0, 20))

        base_market = 165_000
        market_factor = COMPANIES[company] * ROLES[role] * level_info["multiplier"] * LOCATIONS[location]
        experience_factor = 1 + max(yoe - expected_yoe, -2) * 0.025
        noise = rng.normal(1, 0.075)

        annual_base = round(base_market * market_factor * experience_factor * noise, -3)
        bonus_rate = 0.08 + (level_info["multiplier"] - 0.58) * 0.035 + max(COMPANIES[company] - 1, 0) * 0.035
        equity_rate = 0.10 + (level_info["multiplier"] - 0.58) * 0.14 + max(COMPANIES[company] - 1, 0) * 0.20

        if company in {"Infosys", "TCS", "Wipro"}:
            bonus_rate *= 0.65
            equity_rate *= 0.25
        if company == "Netflix":
            bonus_rate *= 0.55
            equity_rate *= 0.7

        annual_bonus = round(max(annual_base * bonus_rate * rng.normal(1, 0.12), 3_000), -3)
        annual_equity = round(max(annual_base * equity_rate * rng.normal(1, 0.18), 2_000), -3)
        annual_total_comp = annual_base + annual_bonus + annual_equity

        rows.append(
            {
                "company": company,
                "role": role,
                "level": level,
                "location": location,
                "yoe": yoe,
                "annual_base": int(annual_base),
                "annual_bonus": int(annual_bonus),
                "annual_equity": int(annual_equity),
                "annual_total_comp": int(annual_total_comp),
            }
        )

    return pd.DataFrame(rows)


def train_model() -> dict:
    data = generate_training_data()
    features = ["company", "role", "level", "location", "yoe"]
    targets = ["annual_base", "annual_bonus", "annual_equity", "annual_total_comp"]

    x_train, x_test, y_train, y_test = train_test_split(
        data[features],
        data[targets],
        test_size=0.18,
        random_state=RANDOM_SEED,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), ["company", "role", "level", "location"]),
            ("numeric", "passthrough", ["yoe"]),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=240,
                    min_samples_leaf=2,
                    random_state=RANDOM_SEED,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    model.fit(x_train, y_train)
    score = model.score(x_test, y_test)

    artifact = {
        "model": model,
        "training_data": data,
        "features": features,
        "targets": targets,
        "score": float(score),
    }
    joblib.dump(artifact, MODEL_PATH)
    return artifact


if __name__ == "__main__":
    saved = train_model()
    print(f"Saved model to {MODEL_PATH}")
    print(f"Validation R^2: {saved['score']:.3f}")
