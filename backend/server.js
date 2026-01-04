const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./aegis.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Connected to SQLite database.');
});

const parseCSV = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => line.split(','));
};

db.serialize(() => {
  // 1. UPDATED PATIENTS TABLE SCHEMA
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    healthScore INTEGER,
    cortisol INTEGER,
    hrv INTEGER,
    sleepAvg REAL,
    diagnosis TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT,
    month TEXT,
    glucose INTEGER,
    insulin REAL
  )`);

  // SEED PATIENTS
  db.get("SELECT count(*) as count FROM patients", (err, row) => {
    if (row.count === 0) {
      console.log("📂 Seeding 300 Patients...");
      const patients = parseCSV(path.join(__dirname, 'data', 'patients.csv'));
      const stmt = db.prepare("INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      patients.forEach(r => {
        // Ensure types match Schema
        stmt.run(r[0], r[1], parseInt(r[2]), r[3], parseInt(r[4]), parseInt(r[5]), parseInt(r[6]), parseFloat(r[7]), r[8]);
      });
      stmt.finalize();
    }
  });

  // SEED VITALS
  db.get("SELECT count(*) as count FROM vitals", (err, row) => {
    if (row.count === 0) {
      console.log("📂 Seeding Longitudinal Vitals...");
      const vitals = parseCSV(path.join(__dirname, 'data', 'vitals.csv'));
      const stmt = db.prepare("INSERT INTO vitals (patient_id, month, glucose, insulin) VALUES (?, ?, ?, ?)");
      vitals.forEach(r => stmt.run(r[0], r[1], parseInt(r[2]), parseFloat(r[3])));
      stmt.finalize();
    }
  });
});

// API: Get Random Patient (For Demo Purpose)
app.get('/api/patient/random', (req, res) => {
  // Get a random ID from the list to simulate picking a patient
  db.get("SELECT id FROM patients ORDER BY RANDOM() LIMIT 1", (err, row) => {
    if(row) res.json({ id: row.id });
  });
});

app.get('/api/patient/:id', (req, res) => {
  db.get("SELECT * FROM patients WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(400).json({error: err.message});
    res.json({ ...row, riskProbability: row.healthScore < 70 ? 84 : 12 });
  });
});

app.get('/api/vitals/:id', (req, res) => {
  db.all("SELECT month, glucose, insulin FROM vitals WHERE patient_id = ?", [req.params.id], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  let reply = "Processing...";
  if (message.toLowerCase().includes('cortisol')) reply = "Cortisol levels are elevated (22 ug/dL). This blunts insulin sensitivity.";
  else if (message.toLowerCase().includes('hrv')) reply = "HRV is critically low (28ms). Suggests sympathetic nervous system overdrive.";
  else reply = "Aegis AI is analyzing the metabolic vector. Ask about 'Cortisol' or 'HRV'.";
  
  setTimeout(() => res.json({ 
    id: Date.now().toString(), sender: 'ai', text: reply, 
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  }), 800);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));