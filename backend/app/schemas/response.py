from pydantic import BaseModel


class SHAPFeature(BaseModel):
    feature_name: str
    shap_value: float
    direction: str


class AnalyzeResponse(BaseModel):
    verdict: str
    confidence: float
    shap_features: list[SHAPFeature]
    explanation: str | None
