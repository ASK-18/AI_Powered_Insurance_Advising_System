"""
ml_model.py
───────────────────────────────────────────────────────────────────────────────
Loads the trained Gradient Boosting model, feature columns, and risk
thresholds. Predicts insurance charges in the same unit as the dataset (USD).

FIXES:
  1. Manual encoding instead of get_dummies on single row
     (get_dummies on a single row silently drops all dummy columns)
  2. No INR conversion — charges shown as USD matching the dataset
  3. No scaling — Gradient Boosting is a tree model, scale-invariant
───────────────────────────────────────────────────────────────────────────────
"""

import joblib
import pandas as pd

# ─── Load saved ML artifacts ──────────────────────────────────────────────────
_model           = joblib.load("saved_model/insurance_model.joblib")
_feature_columns = joblib.load("saved_model/feature_columns.joblib")
_thresholds      = joblib.load("saved_model/risk_thresholds.joblib")

LOW_RISK_THRESHOLD  = _thresholds["low_risk"]   # ~6360 USD
HIGH_RISK_THRESHOLD = _thresholds["high_risk"]  # ~12648 USD


def _build_input(age: float, bmi: float, sex: str,
                 smoker: str, children: int, region: str) -> pd.DataFrame:
    """
    Manually encode to exactly match training's get_dummies(drop_first=True):
      sex:    dropped 'female'    → sex_male = 1 only for male
      smoker: dropped 'no'        → smoker_yes = 1 only for yes
      region: dropped 'northeast' → 3 dummies for nw / se / sw
    """
    sex    = sex.lower().strip()
    smoker = smoker.lower().strip()
    region = region.lower().strip()

    row = {
        "age":               float(age),
        "bmi":               float(bmi),
        "children":          int(children),
        "sex_male":          1 if sex == "male"       else 0,
        "smoker_yes":        1 if smoker == "yes"     else 0,
        "region_northwest":  1 if region == "northwest" else 0,
        "region_southeast":  1 if region == "southeast" else 0,
        "region_southwest":  1 if region == "southwest" else 0,
    }

    return pd.DataFrame([row])[_feature_columns]


def _classify_risk(predicted_usd: float) -> str:
    if predicted_usd < LOW_RISK_THRESHOLD:
        return "Low"
    elif predicted_usd < HIGH_RISK_THRESHOLD:
        return "Medium"
    else:
        return "High"


def _recommend_plan(risk: str) -> str:
    return {
        "Low":    "Basic Shield Plan",
        "Medium": "SecurePlus Plan",
        "High":   "PremiumCare Plan",
    }[risk]


def _generate_explanation(age: float, bmi: float, sex: str, smoker: str,
                           children: int, risk: str,
                           predicted_usd: float) -> str:
    factors = []

    if smoker == "yes":
        factors.append("being a smoker (the single biggest cost driver)")
    if bmi >= 30:
        factors.append(f"a BMI of {bmi:.1f} (classified as obese)")
    elif bmi >= 25:
        factors.append(f"a BMI of {bmi:.1f} (classified as overweight)")
    if age >= 55:
        factors.append(f"your age ({int(age)}), which significantly raises risk")
    elif age >= 40:
        factors.append(f"your age ({int(age)}), which moderately increases risk")
    if children >= 3:
        factors.append(f"having {children} dependents")

    risk_descriptions = {
        "Low":    "low — you're a relatively healthy profile with manageable predicted costs",
        "Medium": "moderate — some lifestyle or demographic factors are elevating your risk",
        "High":   "high — multiple factors are significantly increasing your predicted costs",
    }

    if factors:
        explanation = (
            f"Based on your profile, your overall risk level is {risk_descriptions[risk]}. "
            f"The key factors influencing this result are: {', '.join(factors)}. "
            f"Your estimated annual insurance charges are ${predicted_usd:,.2f}."
        )
    else:
        explanation = (
            f"Based on your profile, your overall risk level is {risk_descriptions[risk]}. "
            f"Your age, BMI, and lifestyle factors all appear within healthy ranges. "
            f"Your estimated annual insurance charges are ${predicted_usd:,.2f}."
        )

    plan_reasons = {
        "Low":    "The Basic Shield Plan provides essential coverage suited to your low-risk profile at an affordable premium.",
        "Medium": "The SecurePlus Plan offers balanced coverage with critical illness options, well-matched to your moderate-risk profile.",
        "High":   "The PremiumCare Plan provides comprehensive coverage including critical illness and OPD benefits, recommended for your higher-risk profile.",
    }

    return explanation + " " + plan_reasons[risk]


# ─── Public API ───────────────────────────────────────────────────────────────

def predict_insurance(age: float, bmi: float, sex: str, smoker: str,
                      children: int, region: str) -> dict:
    input_df      = _build_input(age, bmi, sex, smoker, children, region)
    predicted_usd = float(_model.predict(input_df)[0])
    risk          = _classify_risk(predicted_usd)

    return {
        "predicted_charges": round(predicted_usd, 2),
        "risk":              risk,
        "plan":              _recommend_plan(risk),
        "explanation":       _generate_explanation(
                                 age, bmi, sex, smoker, children, risk, predicted_usd
                             ),
    }