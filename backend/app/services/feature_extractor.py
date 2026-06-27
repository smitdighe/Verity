import re

import numpy as np
import scipy.sparse as sp

KEYWORD_FLAGS = {
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

SALARY_PATTERN = re.compile(
    r"\$[\d,]+|\d+k|\d+,\d+\s*(per|/)\s*(year|hr|hour|month)",
    re.IGNORECASE,
)


def extract_features(job_text: str, vectorizer) -> sp.csr_matrix:
    """
    Takes raw job posting text string and fitted vectorizer.
    Returns scipy sparse matrix of shape (1, 5010).
    Column order: [TF-IDF x5000] + [boolean x4] + [keyword flags x6]
    """
    text = job_text.lower().strip()

    tfidf_matrix = vectorizer.transform([text])

    has_salary_range = 1 if SALARY_PATTERN.search(text) else 0
    has_company_profile = 1 if len(text) > 200 else 0
    has_required_experience = (
        1
        if any(
            w in text
            for w in [
                "years of experience",
                "year experience",
                "experience required",
                "experience in",
                "experience with",
            ]
        )
        else 0
    )
    has_employment_type = (
        1
        if any(
            w in text
            for w in [
                "full-time",
                "part-time",
                "contract",
                "full time",
                "part time",
                "temporary",
                "permanent",
                "freelance",
            ]
        )
        else 0
    )

    boolean_features = np.array(
        [
            [
                has_salary_range,
                has_company_profile,
                has_required_experience,
                has_employment_type,
            ]
        ],
        dtype=np.float64,
    )

    flag_values = []
    for flag_name, keywords in KEYWORD_FLAGS.items():
        hit = int(any(kw in text for kw in keywords))
        flag_values.append(hit)

    flag_features = np.array([flag_values], dtype=np.float64)

    structured = np.hstack([boolean_features, flag_features])
    structured_sparse = sp.csr_matrix(structured)

    X = sp.hstack([tfidf_matrix, structured_sparse])
    return X.tocsr()
