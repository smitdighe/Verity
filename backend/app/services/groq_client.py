from groq import AsyncGroq

from app.config import settings
from app.schemas.response import SHAPFeature


async def get_explanation(
    verdict: str,
    confidence: float,
    shap_features: list[SHAPFeature],
) -> str | None:
    """
    Calls Groq API to generate a plain-English explanation.
    Returns explanation string, or None on any failure.
    """
    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

        feature_lines = []
        for f in shap_features[:5]:
            direction = "toward SCAM" if f.direction == "SCAM" else "toward LEGIT"
            feature_lines.append(
                f"  - {f.feature_name} (pushed {direction}, weight: {f.shap_value})"
            )
        feature_summary = "\n".join(feature_lines)

        prompt = f"""You are a job fraud detection assistant. An ML model has analyzed a job posting.

Result: {verdict}
Scam confidence: {confidence * 100:.1f}%

Top signals that influenced this decision:
{feature_summary}

Write 2-3 sentences directly to the job seeker explaining why this posting looks {"suspicious" if verdict == "SCAM" else "legitimate"}.
Be specific about the signals. Use plain English. Do not use bullet points. Do not mention "ML model" or "SHAP".
If it's a SCAM, warn them clearly. If it's LEGIT, reassure them but remind them to stay cautious."""

        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.4,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[Groq] Failed to get explanation: {e}")
        return None
