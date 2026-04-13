"""
Machine Learning Regression Workflow
------------------------------------
1. Data Loading
2. Exploratory Data Analysis (EDA)
3. Train / Test Split
4. Data Preprocessing
5. Feature Scaling
6. Model Training
7. Model Evaluation
8. Model Persistence (Backend Use)
"""

# ============================================================
# 0. Import Required Libraries
# ============================================================

import os
import warnings
import numpy as np
import pandas as pd

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor

import joblib

warnings.filterwarnings("ignore")


# ============================================================
# 1. Data Loading
# ============================================================

df = pd.read_csv("insurance.csv")

print("\nFirst 5 Rows:\n", df.head())
print("\nDataset Shape:", df.shape)
print("\nDataset Info:")
print(df.info())
print("\nMissing Values:\n", df.isnull().sum())
print("\nDuplicate Rows:", df.duplicated().sum())
print("\nStatistical Summary:\n", df.describe())


# ============================================================
# 2. Exploratory Data Analysis (EDA)
# ============================================================

numeric_cols = ["age", "bmi", "children", "charges"]
categorical_cols = ["sex", "smoker", "region"]

os.makedirs("plots/univariate", exist_ok=True)
os.makedirs("plots/bivariate", exist_ok=True)
os.makedirs("plots/multivariate", exist_ok=True)

# -------------------------
# 2.1 Univariate Analysis
# -------------------------

for col in numeric_cols:
    plt.figure()
    sns.histplot(df[col], kde=True)
    plt.title(f"Distribution of {col}")
    plt.tight_layout()
    plt.savefig(f"plots/univariate/{col}_distribution.png")
    plt.close()

for col in numeric_cols:
    plt.figure()
    sns.boxplot(x=df[col])
    plt.title(f"Boxplot of {col}")
    plt.tight_layout()
    plt.savefig(f"plots/univariate/{col}_boxplot.png")
    plt.close()


# -------------------------
# 2.2 Bivariate Analysis
# -------------------------

num_pairs = [
    ("age", "charges"),
    ("bmi", "charges"),
    ("children", "charges"),
]

for x, y in num_pairs:
    plt.figure()
    sns.scatterplot(x=df[x], y=df[y])
    plt.title(f"{x.capitalize()} vs {y.capitalize()}")
    plt.tight_layout()
    plt.savefig(f"plots/bivariate/{x}_vs_{y}.png")
    plt.close()

cat_num_pairs = [
    ("sex", "charges"),
    ("smoker", "charges"),
    ("region", "charges"),
]

for cat, num in cat_num_pairs:
    plt.figure()
    sns.boxplot(x=df[cat], y=df[num])
    plt.title(f"{cat.capitalize()} vs {num.capitalize()}")
    plt.tight_layout()
    plt.savefig(f"plots/bivariate/{cat}_vs_{num}.png")
    plt.close()

interaction_pairs = [("age", "charges"), ("bmi", "charges")]

for x, y in interaction_pairs:
    plt.figure()
    sns.scatterplot(x=df[x], y=df[y], hue=df["smoker"])
    plt.title(f"{x.capitalize()} vs {y.capitalize()} by Smoker")
    plt.tight_layout()
    plt.savefig(f"plots/bivariate/{x}_vs_{y}_by_smoker.png")
    plt.close()


# -------------------------
# 2.3 Multivariate Analysis
# -------------------------

pairplot_cols = ["age", "bmi", "children", "charges"]

g = sns.pairplot(df[pairplot_cols], diag_kind="kde")
g.fig.suptitle("Pairplot of Numeric Features", y=1.02)
g.savefig("plots/multivariate/pairplot_numeric.png")
plt.close("all")

g = sns.pairplot(df, vars=pairplot_cols, hue="smoker", diag_kind="kde")
g.fig.suptitle("Pairplot by Smoker Status", y=1.02)
g.savefig("plots/multivariate/pairplot_by_smoker.png")
plt.close("all")

correlation_matrix = df.corr(numeric_only=True)

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlation Matrix - Numeric Features")
plt.tight_layout()
plt.savefig("plots/multivariate/correlation_heatmap.png")
plt.close()


# ============================================================
# 3. Feature Encoding
# ============================================================

X = df.drop("charges", axis=1)
y = df["charges"]

X_encoded = pd.get_dummies(X, drop_first=True).astype(int)
print("Encoded Features:\n", X_encoded.columns.tolist())


# ============================================================
# 4. Train / Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded,
    y,
    test_size=0.15,
    random_state=42
)

# ============================================================
# Risk Threshold Calculation (Decision Layer Preparation)
# ============================================================

low_risk_threshold  = y_train.quantile(0.33)
high_risk_threshold = y_train.quantile(0.66)

print("\nRisk Thresholds (Derived from Training Data):")
print(f"Low Risk    < {low_risk_threshold:.2f}")
print(f"Medium Risk >= {low_risk_threshold:.2f} and < {high_risk_threshold:.2f}")
print(f"High Risk   >= {high_risk_threshold:.2f}")

# ============================================================
# 5. Feature Scaling
# ============================================================

numeric_cols = ["age", "bmi", "children"]

scaler = StandardScaler()

X_train_scaled = X_train.copy()
X_test_scaled  = X_test.copy()

X_train_scaled[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])
X_test_scaled[numeric_cols]  = scaler.transform(X_test[numeric_cols])


# ============================================================
# 6. Model Training & Evaluation
# ============================================================

models = {
    "Linear Regression":       LinearRegression(),
    "Support Vector Regressor": SVR(kernel="rbf"),
    "Decision Tree":           DecisionTreeRegressor(random_state=42),
    "Random Forest":           RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
    "KNN Regressor":           KNeighborsRegressor(n_neighbors=5),
    "Gradient Boosting":       GradientBoostingRegressor(random_state=42),
}

scaled_models = {"Linear Regression", "Support Vector Regressor", "KNN Regressor"}

def evaluate_model(model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    return (
        r2_score(y_test, y_pred),
        np.sqrt(mean_squared_error(y_test, y_pred)),
        mean_absolute_error(y_test, y_pred),
    )

results        = []
trained_models = {}

for name, model in models.items():
    Xtr, Xte = (
        (X_train_scaled, X_test_scaled) if name in scaled_models
        else (X_train, X_test)
    )
    r2, rmse, mae = evaluate_model(model, Xtr, Xte, y_train, y_test)
    trained_models[name] = model
    results.append({"Model": name, "R2 Score": r2, "RMSE": rmse, "MAE": mae})

results_df = pd.DataFrame(results).sort_values(by="RMSE").round(3)
print("\nModel Performance Comparison:")
print(results_df)


# ============================================================
# 7. Cross-Validation Analysis
# ============================================================

cv_results = []

for name, model in models.items():
    X_cv     = X_train_scaled if name in scaled_models else X_train
    cv_scores = cross_val_score(model, X_cv, y_train, cv=5, scoring="r2", n_jobs=-1)
    cv_results.append({
        "Model":      name,
        "CV Mean R2": cv_scores.mean(),
        "CV Std R2":  cv_scores.std(),
    })

cv_results_df = (
    pd.DataFrame(cv_results)
    .sort_values(by="CV Mean R2", ascending=False)
    .round(4)
)
print("\nCross-Validation Performance Comparison:")
print(cv_results_df)


# ============================================================
# 8. Feature Importance Analysis
# ============================================================

os.makedirs("plots/feature_importance", exist_ok=True)

feature_names = X_train.columns
tree_models   = {
    "Decision Tree":    trained_models["Decision Tree"],
    "Random Forest":    trained_models["Random Forest"],
    "Gradient Boosting": trained_models["Gradient Boosting"],
}

for model_name, model in tree_models.items():
    importance_df = (
        pd.DataFrame({"Feature": feature_names, "Importance": model.feature_importances_})
        .sort_values(by="Importance", ascending=False)
    )
    plt.figure(figsize=(10, 6))
    sns.barplot(x="Importance", y="Feature", data=importance_df.head(10))
    plt.title(f"Top 10 Feature Importances - {model_name}")
    plt.tight_layout()
    plt.savefig(f"plots/feature_importance/{model_name.lower().replace(' ', '_')}_feature_importance.png")
    plt.close()
    print(f"\nTop Features for {model_name}:")
    print(importance_df.head(10))


# ============================================================
# 9. Save Best Model & Risk Logic for Backend
# ============================================================

os.makedirs("saved_model", exist_ok=True)

final_model = trained_models["Gradient Boosting"]

joblib.dump(final_model,              "saved_model/insurance_model.joblib")
joblib.dump(scaler,                   "saved_model/scaler.joblib")
joblib.dump(X_train.columns.tolist(), "saved_model/feature_columns.joblib")
joblib.dump(
    {"low_risk": low_risk_threshold, "high_risk": high_risk_threshold},
    "saved_model/risk_thresholds.joblib"
)

print("\n✅ Model, scaler, feature columns, and risk thresholds saved successfully!")