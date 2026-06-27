from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str
    MODEL_PATH: str = "ml_artifacts/model.joblib"
    EXPLAINER_PATH: str = "ml_artifacts/explainer.joblib"
    VECTORIZER_PATH: str = "ml_artifacts/tfidf_vectorizer.joblib"
    METADATA_PATH: str = "ml_artifacts/model_metadata.json"
    GROQ_MODEL: str = "llama3-8b-8192"
    TOP_SHAP_FEATURES: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
