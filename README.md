
***

# 🛡️ Aegis: AI-Driven "Silent Disease" Detection Engine

> **A Next-Gen Medical Dashboard for Early Metabolic Risk Prediction.**

Aegis is a Full-Stack HealthTech prototype designed to identify "Silent" metabolic risks (like Insulin Resistance and Adrenal Fatigue) months before they appear on standard clinical panels. It compares standard "Green" clinical data against AI-driven velocity metrics to predict biomarkers like HOMA-IR spikes.

![Status](https://img.shields.io/badge/Status-Prototype-cyan)
![Stack](https://img.shields.io/badge/Stack-PERN%20Light-blue)

---

## ⚡ The User Story: "Sarah"

1.  **The Trap (Clinical View):** Sarah's standard labs (BP, Glucose) are "Green/Normal." Doctors say she is healthy.
2.  **The Truth (Aegis View):** Her metabolic velocity is fatal. HRV is dropping (-15%), and Fasting Insulin is spiking (+400%) to compensate for the glucose.
3.  **The Prediction:** Aegis predicts **"Pre-Diabetes & Adrenal Fatigue"** (84% probability) 18 months before clinical diagnosis.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React 18 + TypeScript + Vite
*   **Styling:** Tailwind CSS (Glassmorphism & Cyberpunk UI)
*   **Animations:** Framer Motion
*   **Visualization:** Recharts (Area Charts, Radar Charts, Gauges)
*   **Icons:** Lucide React

### Backend (Server)
*   **Runtime:** Node.js + Express
*   **Database:** SQLite (Zero-config, file-based)
*   **Data Pipeline:** Python (Synthetic Data Generation) -> CSV -> SQLite

---

## 🚀 Quick Start Tutorial

Follow these steps to run the project locally or in GitHub Codespaces.

### Phase 1: Backend Setup
The backend handles the SQLite database and serves patient API endpoints.

1.  Open a terminal and navigate to the backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    *   **What happens:** The server will automatically wipe the old database, read the CSV files in `backend/data/`, seed 300 new patients, and start listening on **Port 5000**.

### Phase 2: Frontend Setup
The frontend is the React dashboard.

1.  Open a **new** terminal (keep backend running) and navigate to frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the link provided (usually `http://localhost:5173`).

---

## 🧬 Data Generation (Optional)

Want new patients? We use a Python script to generate realistic metabolic data for 300 synthetic patients.

1.  Make sure you are in the **root** folder.
2.  Run the generator:
    ```bash
    python generate_data.py
    ```
3.  This updates `backend/data/patients.csv` and `vitals.csv`.
4.  **Restart the Backend Server** to load the new data into SQLite.

---

## 🕹️ Application Features

### 1. The "Silent Insight" Toggle
Located in the top-left profile card.
*   **Clinical View:** Shows standard medical badges (everything looks normal).
*   **Aegis View:** Reveals the AI prediction, changing the UI state to "Warning" and showing the risk probability bar.

### 2. Velocity Chart (Glucose vs. Insulin)
*   Visualizes the core problem: Glucose (Green line) remains flat/healthy, while Insulin (Red Area) spikes over 6 months. This represents "Silent Resistance."

### 3. AI Copilot
*   A chat interface connected to the backend.
*   **Try typing:** *"generate protocol"* or *"check cortisol risks"* to see the backend respond with medical advice.

### 4. Random Patient Loading
*   Every time you refresh the page, the app fetches a random patient ID from the database of 300 entries, allowing you to test different medical scenarios (Healthy vs. Chronic vs. Silent).

---

## 🔧 Configuration & Architecture

### Proxy Setup (Crucial for Codespaces)
To ensure the Frontend can talk to the Backend without CORS errors or Port issues, we use a **Vite Proxy**.

*File: `frontend/vite.config.ts`*
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```
This redirects any request sent to `/api...` directly to the backend server.

---

## 🆘 Troubleshooting

### 1. "Connection Failed" / Red Error Screen
*   **Cause:** The frontend cannot reach the backend.
*   **Fix:** Ensure the backend terminal is running. If using Codespaces, ensure you haven't hardcoded `http://localhost:5000` in `App.tsx` (leave `API_URL` as an empty string `""` to use the proxy).

### 2. Database Crashes / Unique Constraint Error
*   **Cause:** Duplicate IDs in the database.
*   **Fix:** The current `server.js` is built to auto-heal. Simply **Restart the Backend**. It will `DROP` the old tables and recreate them fresh from the CSVs.

### 3. Styling looks broken / No Dark Mode
*   **Cause:** Tailwind isn't processing.
*   **Fix:** Ensure `frontend/src/index.css` contains the `@tailwind` directives and that `postcss.config.js` exists in the frontend folder.