import os
import json
import numpy as np
import pandas as pd
import scipy.sparse as sp
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
)
import shap
import joblib

print("Loading dataset...")
data_path = os.path.join(os.path.dirname(__file__), "fake_job_postings.csv")
df = pd.read_csv(data_path)
print(f"Dataset shape: {df.shape}")
print(f"Class distribution:\n{df['fraudulent'].value_counts()}\n")

text_columns = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
]
metadata_columns = [
    "salary_range",
    "employment_type",
    "required_experience",
]

for col in text_columns + metadata_columns:
    df[col] = df[col].fillna("")

print("NaN values filled with empty strings.")

df["combined_text"] = (
    df["title"]
    + " "
    + df["company_profile"]
    + " "
    + df["description"]
    + " "
    + df["requirements"]
    + " "
    + df["benefits"]
).str.lower()

df["has_salary_range"] = (df["salary_range"].str.len() > 0).astype(int)
df["has_company_profile"] = (df["company_profile"].str.len() > 0).astype(int)
df["has_required_experience"] = (df["required_experience"].str.len() > 0).astype(int)
df["has_employment_type"] = (df["employment_type"].str.len() > 0).astype(int)

flag_definitions = {
    "flag_run_commands": [
        "run commands",
        "execute script",
        "command prompt",
        "run the software",
        "open the link and run",
    ],
    "flag_download": [
        "download",
        "install software",
        "click the link",
        "software required",
        "install the app",
    ],
    "flag_crypto": [
        "bitcoin",
        "cryptocurrency",
        "crypto",
        "ethereum",
        "wallet address",
        "btc",
    ],
    "flag_wire_transfer": [
        "wire transfer",
        "western union",
        "moneygram",
        "bank transfer",
        "money transfer",
    ],
    "flag_urgent": [
        "urgent",
        "immediate start",
        "reply asap",
        "limited slots",
        "act now",
        "don't miss",
        "apply immediately",
    ],
    "flag_deposit": [
        "deposit required",
        "upfront fee",
        "processing fee",
        "registration fee",
        "pay to apply",
        "refundable deposit",
    ],
}

for flag_name, keywords in flag_definitions.items():
    df[flag_name] = df["combined_text"].apply(
        lambda text: int(any(kw in text for kw in keywords))
    )

structured_feature_names = [
    "has_salary_range",
    "has_company_profile",
    "has_required_experience",
    "has_employment_type",
    "flag_run_commands",
    "flag_download",
    "flag_crypto",
    "flag_wire_transfer",
    "flag_urgent",
    "flag_deposit",
]

structured_features = df[structured_feature_names].values  # (n, 10)

print(f"Boolean + keyword features shape: {structured_features.shape}")
print(f"Keyword flag sums:\n{df[structured_feature_names].sum()}\n")

y = df["fraudulent"].values

indices = np.arange(len(df))
idx_train, idx_test, y_train, y_test = train_test_split(
    indices, y, test_size=0.2, random_state=42, stratify=y
)

combined_text_train = df["combined_text"].iloc[idx_train]
combined_text_test = df["combined_text"].iloc[idx_test]

structured_train = structured_features[idx_train]
structured_test = structured_features[idx_test]

print(f"Train size: {len(idx_train)}, Test size: {len(idx_test)}")
print(
    f"Train class dist: {np.bincount(y_train)}, "
    f"Test class dist: {np.bincount(y_test)}\n"
)

vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True,
)

tfidf_train = vectorizer.fit_transform(combined_text_train)
tfidf_test = vectorizer.transform(combined_text_test)

print(f"TF-IDF train shape: {tfidf_train.shape}")
print(f"TF-IDF test shape:  {tfidf_test.shape}\n")


structured_train_sparse = sp.csr_matrix(structured_train)
structured_test_sparse = sp.csr_matrix(structured_test)

X_train = sp.hstack([tfidf_train, structured_train_sparse])
X_test = sp.hstack([tfidf_test, structured_test_sparse])

tfidf_feature_names = vectorizer.get_feature_names_out().tolist()
feature_names = tfidf_feature_names + structured_feature_names

print(f"Final X_train shape: {X_train.shape}")
print(f"Final X_test shape:  {X_test.shape}")
print(f"Total feature names: {len(feature_names)}")
assert len(feature_names) == X_train.shape[1], (
    f"Feature name count mismatch: {len(feature_names)} != {X_train.shape[1]}"
)
print()


print("Training Logistic Regression...")
lr_model = LogisticRegression(
    class_weight="balanced",
    max_iter=1000,
    random_state=42,
    solver="lbfgs",
)
lr_model.fit(X_train, y_train)
print("Logistic Regression trained.\n")

print("Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
    max_depth=20,
    min_samples_leaf=2,
)
rf_model.fit(X_train, y_train)
print("Random Forest trained.\n")

def evaluate_model(model, model_name, X_test, y_test):
    """Evaluate a model and return metrics dict."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="binary")
    rec = recall_score(y_test, y_pred, average="binary")
    f1 = f1_score(y_test, y_pred, average="binary")
    roc = roc_auc_score(y_test, y_proba)

    print("=" * 60)
    print(f"MODEL: {model_name}")
    print("=" * 60)
    print(f"Accuracy  : {acc:.4f}")
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc:.4f}")
    print()
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("=" * 60)
    print()

    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "roc_auc": roc}


lr_metrics = evaluate_model(lr_model, "Logistic Regression", X_test, y_test)
rf_metrics = evaluate_model(rf_model, "Random Forest", X_test, y_test)


models = {
    "Logistic Regression": (lr_model, lr_metrics),
    "Random Forest": (rf_model, rf_metrics),
}

best_model_name = max(models, key=lambda k: models[k][1]["roc_auc"])
best_model, best_metrics = models[best_model_name]
best_roc_auc = best_metrics["roc_auc"]

print(f">>> Best model by ROC-AUC: {best_model_name} (ROC-AUC: {best_roc_auc:.4f})\n")


print("Setting up SHAP explainer...")

if best_model_name == "Random Forest":
    X_train_dense_sample = X_train[:500].toarray()
    explainer = shap.TreeExplainer(best_model)
    shap_values = explainer.shap_values(X_train_dense_sample)
    print(f"SHAP values shape (RF): {shap_values[1].shape}")
    vals = shap_values[1]

elif best_model_name == "Logistic Regression":
    explainer = shap.LinearExplainer(
        best_model, X_train, feature_perturbation="interventional"
    )
    shap_values = explainer.shap_values(X_train[:500])
    print(f"SHAP values shape (LR): {shap_values.shape}")
    vals = shap_values

mean_abs_shap = np.abs(vals).mean(axis=0)
top_indices = np.argsort(mean_abs_shap)[::-1][:10]

print("\nTop 10 SHAP features (global):")
for i in top_indices:
    print(f"  {feature_names[i]:<40} mean |SHAP|: {mean_abs_shap[i]:.4f}")
print()

artifacts_dir = os.path.join(os.path.dirname(__file__), "..", "ml_artifacts")
os.makedirs(artifacts_dir, exist_ok=True)

joblib.dump(best_model, os.path.join(artifacts_dir, "model.joblib"))
joblib.dump(explainer, os.path.join(artifacts_dir, "explainer.joblib"))
joblib.dump(vectorizer, os.path.join(artifacts_dir, "tfidf_vectorizer.joblib"))

metadata = {
    "model_type": best_model_name,
    "feature_names": feature_names,
    "n_features": len(feature_names),
    "tfidf_max_features": 5000,
    "structured_feature_names": structured_feature_names,
    "roc_auc": round(float(best_roc_auc), 4),
}
with open(os.path.join(artifacts_dir, "model_metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("Artifacts saved:")
print("  ml_artifacts/model.joblib")
print("  ml_artifacts/explainer.joblib")
print("  ml_artifacts/tfidf_vectorizer.joblib")
print("  ml_artifacts/model_metadata.json")
print("\nDone.")
