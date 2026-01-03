from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="SentryHealth AI Engine")
class HealthData(BaseModel):
    age: int
    systolic_bp: int
    glucose_level: float
    sleep_hours: float
    stress_level: int # 1-10
    family_history_diabetes: bool

@app.get("/")
def home():
    return {"message": "SentryHealth Early Detection Engine is Online"}

@app.post("/predict_risk")
async def predict_risk(data: HealthData):
    # This is a placeholder for the ML Model Logic
    # In a real scenario, you'd load a .pkl model here
    
    risk_score = (data.glucose_level * 0.4) + (data.systolic_bp * 0.3) + (data.stress_level * 1.5)
    probability = min(99.9, risk_score / 2) # Mock normalization
    
    return {
        "risk_probability": f"{round(probability, 2)}%",
        "status": "High" if probability > 70 else "Elevated" if probability > 40 else "Low",
        "recommendation": "Consult a specialist for a HbA1c test" if probability > 60 else "Continue regular monitoring"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)