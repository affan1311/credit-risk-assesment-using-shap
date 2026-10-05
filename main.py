from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import joblib
import pandas as pd
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

ml_model = {} # Placeholder for the actual ML model

def _register_sklearn_legacy_compatibility() -> None:
    """Allow models serialized by scikit-learn 1.6 to load on newer versions."""
    from sklearn.compose import _column_transformer

    if not hasattr(_column_transformer, '_RemainderColsList'):
        class _RemainderColsList(list):
            pass

        _column_transformer._RemainderColsList = _RemainderColsList


@asynccontextmanager
async def lifespan(app:FastAPI):
    _register_sklearn_legacy_compatibility()
    model_dir = Path(__file__).resolve().parent
    ml_model['model'] = joblib.load(model_dir / 'credit_risk_model.pkl')
    ml_model['threshold'] = joblib.load(model_dir / 'calibrated_threshold.pkl')

    yield

    ml_model.clear()

app = FastAPI(lifespan=lifespan)

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

@app.get("/", include_in_schema=False)
def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
    )

class LoanApplication(BaseModel): #Pydantic Model (Validation)
    person_age: int
    person_income: float
    person_home_ownership: str
    person_emp_length: float
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    loan_percent_income: float
    cb_person_default_on_file: str
    cb_person_cred_hist_length: int

@app.post("/predict")
def predict_loan_approval(application: LoanApplication):
    input_data = pd.DataFrame([application.model_dump()])

    prediction_proba = ml_model['model'].predict_proba(input_data)[:, 1][0]

    prediction = 1 if prediction_proba >= ml_model['threshold'] else 0

    return {"prediction": prediction, 
            "probability": prediction_proba, 
            "threshold": ml_model['threshold'],
            "Result": "High Risk" if prediction == 1 else "Low Risk"
            }
