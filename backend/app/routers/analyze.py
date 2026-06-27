from fastapi import APIRouter, Depends

from app.dependencies import (
    get_explainer,
    get_feature_names,
    get_model,
    get_model_type,
    get_vectorizer,
)
from app.schemas.request import AnalyzeRequest
from app.schemas.response import AnalyzeResponse
from app.services import feature_extractor, groq_client, predictor

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    body: AnalyzeRequest,
    model=Depends(get_model),
    explainer=Depends(get_explainer),
    vectorizer=Depends(get_vectorizer),
    feature_names=Depends(get_feature_names),
    model_type=Depends(get_model_type),
):
    X = feature_extractor.extract_features(body.job_text, vectorizer)

    verdict, confidence, shap_features = predictor.predict(
        X, model, explainer, feature_names, model_type
    )

    explanation = await groq_client.get_explanation(verdict, confidence, shap_features)

    return AnalyzeResponse(
        verdict=verdict,
        confidence=confidence,
        shap_features=shap_features,
        explanation=explanation,
    )
