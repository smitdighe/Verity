from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    job_text: str
