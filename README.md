# SentryHealth AI: Silent Disease Early Detection Engine 🛡️🩺

**Hackathon Project: PS 05**

## 📌 Overview
SentryHealth AI is a predictive healthcare engine designed to identify "silent" life-threatening diseases (Diabetes, Hypertension, Chronic Kidney Disease, and Mental Health conditions) before they manifest into clinical emergencies. 

Instead of reactive diagnosis, we use **Longitudinal Data Analysis** to spot subtle shifts in health signals that humans often miss.

## 🚀 Key Features
- **Trend-Based Analysis:** Moves beyond single-point lab results to analyze health trajectory over months/years.
- **Multi-Modal Data Fusion:** Combines Lab Results + Lifestyle (Wearables) + Stress Markers + Family History.
- **Risk Probability Scoring:** Provides a % risk factor rather than a simple "Yes/No" diagnosis.
- **Actionable Preventive Pathways:** Automated clinical recommendations for both patients and doctors.

## 🛠️ Tech Stack
- **Backend:** Python (FastAPI)
- **Machine Learning:** Scikit-learn, XGBoost (for risk scoring), SHAP (for explainability)
- **Frontend:** React.js / Next.js
- **Database:** PostgreSQL (Patient History)
- **Data:** Synthetic GH (Electronic Health Records)

## 📁 Project Structure
```text
├── api/                # FastAPI Backend
├── ml_engine/          # ML Models & Data Processing
├── frontend/           # React/Next.js UI
├── data/               # Sample Synthetic Datasets
└── docs/               # System Architecture & API Docs