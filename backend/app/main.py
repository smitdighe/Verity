import json
from contextlib import asynccontextmanager

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.analyze import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading ML artifacts...")

    app.state.model = joblib.load(settings.MODEL_PATH)
    app.state.explainer = joblib.load(settings.EXPLAINER_PATH)
    app.state.vectorizer = joblib.load(settings.VECTORIZER_PATH)

    with open(settings.METADATA_PATH, "r") as f:
        metadata = json.load(f)

    app.state.model_type = metadata["model_type"]
    app.state.feature_names = metadata["feature_names"]

    print(f"Model loaded: {app.state.model_type}")
    print(f"Features: {len(app.state.feature_names)}")
    print("Ready.")

    yield


app = FastAPI(
    title="Verity API",
    description="Job posting fraud detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://verity-iota-two.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
