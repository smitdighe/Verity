from fastapi import Request


def get_model(request: Request):
    return request.app.state.model


def get_explainer(request: Request):
    return request.app.state.explainer


def get_vectorizer(request: Request):
    return request.app.state.vectorizer


def get_feature_names(request: Request) -> list[str]:
    return request.app.state.feature_names


def get_model_type(request: Request) -> str:
    return request.app.state.model_type
