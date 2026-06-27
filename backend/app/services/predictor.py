import numpy as np

from app.config import settings
from app.schemas.response import SHAPFeature


def predict(
    X,
    model,
    explainer,
    feature_names: list[str],
    model_type: str,
) -> tuple[str, float, list[SHAPFeature]]:
    """
    Returns (verdict, confidence, shap_features).
    verdict: "SCAM" or "LEGIT"
    confidence: float 0.0-1.0 (scam probability)
    shap_features: top N features sorted by |shap_value| descending
    """
    proba = model.predict_proba(X)[0]
    confidence = float(proba[1])
    verdict = "SCAM" if confidence >= 0.4 else "LEGIT"

    if model_type == "Random Forest":
        X_dense = X.toarray()
        shap_vals = explainer.shap_values(X_dense)
        row_shap = shap_vals[1][0]
    else:
        shap_vals = explainer.shap_values(X)
        if hasattr(shap_vals, "toarray"):
            shap_vals = shap_vals.toarray()
        row_shap = np.array(shap_vals[0]).flatten()

    top_n = settings.TOP_SHAP_FEATURES
    top_indices = np.argsort(np.abs(row_shap))[::-1][:top_n]

    shap_features = []
    for idx in top_indices:
        val = float(row_shap[idx])
        shap_features.append(
            SHAPFeature(
                feature_name=feature_names[idx],
                shap_value=round(val, 4),
                direction="SCAM" if val > 0 else "LEGIT",
            )
        )

    return verdict, round(confidence, 4), shap_features
