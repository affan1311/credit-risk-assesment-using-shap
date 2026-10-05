# CrediScope

CrediScope is a credit-risk prediction application built with FastAPI, scikit-learn, XGBoost, and a lightweight HTML/CSS/JavaScript frontend.

The application accepts loan applicant details, runs them through a calibrated machine-learning model, and returns:

- A risk classification
- The predicted probability
- The model's decision threshold
- A human-readable result such as `High Risk` or `Low Risk`

> This project is for educational and demonstration purposes. Predictions are estimates and should not be used as the sole basis for real lending decisions.

## Features

- Responsive browser-based loan risk form
- FastAPI prediction API
- Calibrated XGBoost model
- Input validation with Pydantic
- Risk probability and threshold visualization
- Model loading during application startup
- Scikit-learn compatibility handling for the serialized model

## Project structure

```text
credit-risk-ml/
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── calibrated_threshold.pkl
├── credit_risk_dataset.csv
├── credit_risk_model.pkl
├── main.py
├── Model_training.ipynb
├── README.MD
└── requirements.txt
```

## Requirements

- Python 3.10 or newer
- `pip`
- The serialized model files in the project root:
  - `credit_risk_model.pkl`
  - `calibrated_threshold.pkl`

The project currently pins the serialization-sensitive dependencies to:

```text
scikit-learn==1.9.1
xgboost==3.4.1
```

Keeping these versions aligned with the generated model artifacts helps avoid model-loading errors.

## Installation

Create and activate a virtual environment:

### Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
pip install -r requirements.txt
```

## Run the application

Start the development server from the project root:

```powershell
uvicorn main:app --reload
```

Open the web interface at:

```text
http://127.0.0.1:8000/
```

The interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## API

### `POST /predict`

Request body:

```json
{
  "person_age": 30,
  "person_income": 50000,
  "person_home_ownership": "RENT",
  "person_emp_length": 5,
  "loan_intent": "EDUCATION",
  "loan_grade": "B",
  "loan_amnt": 10000,
  "loan_int_rate": 10,
  "loan_percent_income": 0.2,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 8
}
```

Example response:

```json
{
  "prediction": 0,
  "probability": 0.0179,
  "threshold": 0.4045,
  "Result": "Low Risk"
}
```

The `prediction` value is determined by comparing `probability` with `threshold`:

- `0`: probability is below the threshold (`Low Risk`)
- `1`: probability is at or above the threshold (`High Risk`)

## Model training

The training workflow is documented in [Model_training.ipynb](./Model_training.ipynb). It includes:

1. Loading and exploring the credit-risk dataset
2. Removing duplicates and filtering invalid records
3. Splitting data into training and test sets
4. Imputing missing values
5. Encoding categorical features
6. Training and tuning an XGBoost classifier
7. Calibrating probabilities with `CalibratedClassifierCV`
8. Selecting a probability threshold
9. Saving the model and threshold with Joblib

To retrain the application, run the notebook and replace both `.pkl` files in the project root. Retraining should be performed using the same pinned scikit-learn and XGBoost versions used by the API.

## Input fields

| Field | Description |
|---|---|
| `person_age` | Applicant age |
| `person_income` | Annual income |
| `person_home_ownership` | Home ownership status |
| `person_emp_length` | Employment length in years |
| `loan_intent` | Purpose of the loan |
| `loan_grade` | Assigned loan grade |
| `loan_amnt` | Requested loan amount |
| `loan_int_rate` | Loan interest rate |
| `loan_percent_income` | Loan amount as a proportion of income |
| `cb_person_default_on_file` | Whether a previous default is recorded |
| `cb_person_cred_hist_length` | Length of credit history in years |

## Frontend

The frontend is intentionally dependency-free:

- `index.html` defines the form and result layout.
- `styles.css` provides the responsive styling.
- `app.js` converts form values to JSON and calls `POST /predict`.

FastAPI serves the frontend from the same origin, so no separate frontend development server is required.

## License

No license has been specified for this project yet.