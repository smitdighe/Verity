<div align="center">

<pre>
██╗   ██╗ ███████╗ ██████╗  ██╗ ████████╗ ██╗   ██╗
██║   ██║ ██╔════╝ ██╔══██╗ ██║ ╚══██╔══╝ ╚██╗ ██╔╝
██║   ██║ █████╗   ██████╔╝ ██║    ██║     ╚████╔╝ 
╚██╗ ██╔╝ ██╔══╝   ██╔══██╗ ██║    ██║      ╚██╔╝  
 ╚████╔╝  ███████╗ ██║  ██║ ██║    ██║       ██║   
  ╚═══╝   ╚══════╝ ╚═╝  ╚═╝ ╚═╝    ╚═╝       ╚═╝   
</pre>

### Verify before you apply.

</div>

> 🌐 **Live Demo:** https://verity-iota-two.vercel.app

<div align="center">

**Verity** is an ML-powered job posting fraud detector. Paste any job description and get an instant fraud verdict — backed by a real trained classifier (not just an LLM guess), with SHAP-based explainability and a Groq-powered natural-language breakdown of *why* a posting was flagged.

<br />

[![Verity Demo](https://img.youtube.com/vi/GSIWd9ddaiI/maxresdefault.jpg)](https://www.youtube.com/watch?v=GSIWd9ddaiI)

</div>

---

## 🔍 How It Works

```
job text → TF-IDF + handcrafted features → LogisticRegression.predict_proba
         → SHAP top-10 features → Groq LLM → plain-English verdict → JSON response
```

1. **Feature extraction** builds a 5010-dim sparse vector: 5000 TF-IDF features over `title + company_profile + description + requirements + benefits`, plus 4 structural booleans (salary range, company profile, required experience, employment type) and 6 keyword-flag features (run-commands, download/install, crypto, wire-transfer, urgency, deposit).
2. **Prediction**: verdict is `SCAM` if `proba ≥ 0.4`.
3. **SHAP**: top 10 features by `|shap_value|` returned with direction.
4. **Groq**: top 5 SHAP features → 2-3 sentence explanation. Fails silently to `null` if Groq errors.

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="220">
      <h3>🧠</h3>
      <b>ML-Powered</b><br/>
      <sub>Trained classifier (Logistic Regression) scores every posting on real signal, not vibes</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>📊</h3>
      <b>SHAP Explainable</b><br/>
      <sub>Feature-level breakdown of exactly what drove the fraud score</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>⚡</h3>
      <b>Groq AI Analysis</b><br/>
      <sub>LLM layer turns the model output into a readable, human verdict</sub><br/>
    </td>
  </tr>
  <tr>
    <td align="center" width="220">
      <h3>🔒</h3>
      <b>CORS-Locked API</b><br/>
      <sub>FastAPI backend restricted to the deployed frontend origin only</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>🌗</h3>
      <b>Dark Mode</b><br/>
      <sub>Full light/dark theme toggle across the UI</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>📈</h3>
      <b>5000+ Feature Model</b><br/>
      <sub>Vectorized text features (TF-IDF) feeding the classification pipeline</sub><br/>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| ⚛️ Frontend | React + Vite + TypeScript | Core UI framework and bundler |
| 🎨 Styling | Tailwind CSS + Framer Motion | Responsive design system + UI animation |
| 🗄️ Backend | FastAPI (Python) + Uvicorn | Async API serving the ML pipeline |
| 🤖 ML | scikit-learn (Logistic Regression) | Job posting fraud classification |
| 📊 Explainability | SHAP | Feature-level reasoning per prediction |
| 🧠 LLM | Groq API | Natural-language summary of the verdict |
| ☁️ Hosting | Render (API) + Vercel (Web) | Deployment |

---

## 📊 Model

Trained on the [EMSCAD "Real or Fake Job Postings" dataset](https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction) (~18k postings, ~5% fraudulent).

| | |
|---|---|
| Algorithm | Logistic Regression (calibrated) |
| Features | 5010 (5000 TF-IDF + 10 engineered) |
| ROC-AUC | **0.9895** |
| Explainability | SHAP (linear explainer) |

Training script: `backend/ml_pipeline/train.py`. A Random Forest path exists in `predictor.py`'s SHAP branch for experimentation, but Logistic Regression is deployed.

---

## 📁 Project Structure

```bash
Verity/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   └── analyze.py        # POST /analyze endpoint
│   │   ├── schemas/
│   │   │   ├── request.py        # Pydantic request models
│   │   │   └── response.py       # Pydantic response models
│   │   ├── services/
│   │   │   ├── feature_extractor.py  # Text -> ML features
│   │   │   ├── groq_client.py        # Groq LLM calls
│   │   │   └── predictor.py          # Model inference
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── main.py               # App entry, CORS, router mounting
│   ├── ml_artifacts/             # Saved model + vectorizer
│   ├── ml_pipeline/              # Training scripts
│   ├── .env.example
│   ├── render.yaml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── InputCard.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── Footer.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.ts
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- A Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/smitdighe/Verity.git
cd Verity
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (use `.env.example` as a reference):

```env
GROQ_API_KEY=your_groq_api_key
FRONTEND_ORIGIN=http://localhost:5173
```

Then start the backend server:

```bash
uvicorn app.main:app --reload --port 10000
```

> Backend API will be running at `http://localhost:10000`
> Swagger Documentation available at `http://localhost:10000/docs`

### 3. Setup Frontend

Open a new terminal session and navigate to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

> Frontend will be running at `http://localhost:5173`
> ⚠️ Both the Vite server and the FastAPI server need to be running simultaneously for full functionality.

---

## 🔌 API

`POST /analyze`

```json
// request
{ "job_text": "string" }

// response
{
  "verdict": "SCAM" | "LEGIT",
  "confidence": 0.0,
  "shap_features": [
    { "feature_name": "string", "shap_value": 0.0, "direction": "SCAM" | "LEGIT" }
  ],
  "explanation": "string | null"
}
```

`GET /health` — liveness check. Interactive docs at `/docs` when running locally.

---

## ⚠️ Known Limitations
- Render free tier: spins down after inactivity, can delay first request by 50s+
- Model trained on a single labeled dataset — accuracy varies on out-of-distribution postings
- No persistent storage for analysis history (stateless per request)
- Backend URL hardcoded in `App.tsx` instead of env var

---

## 🔮 Future Improvements

- **PDF/URL ingestion:** Paste a job link or upload a PDF instead of raw text
- **Session history:** Store and revisit past analyses
- **Model retraining pipeline:** Periodic retraining on newer scam posting data

---
