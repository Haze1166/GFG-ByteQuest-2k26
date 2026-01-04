import csv
import random
import uuid

# --- CONFIGURATION ---
NUM_PATIENTS = 300
MONTHS = ['Jan', 'Mar', 'Jun', 'Sep', 'Nov', 'Now']

def get_profile():
    """Determines if patient is Healthy, Silent Risk, or Chronic"""
    r = random.random()
    if r < 0.4: return "HEALTHY"
    if r < 0.7: return "SILENT" # This is the target for Aegis
    return "CHRONIC"

patients = []
vitals_log = []

print(f"Generating synthetic data for {NUM_PATIENTS} patients...")

for _ in range(NUM_PATIENTS):
    p_id = f"AEG-{random.randint(1000, 9999)}"
    gender = random.choice(['Male', 'Female'])
    first_names_m = ['James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles']
    first_names_f = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
    name = f"{random.choice(first_names_m if gender == 'Male' else first_names_f)} {random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'])}"
    
    profile = get_profile()
    
    # 1. BASE ATTRIBUTES
    if profile == "HEALTHY":
        age = random.randint(20, 45)
        health_score = random.randint(85, 99)
        cortisol = random.randint(6, 12) # Low stress
        hrv = random.randint(60, 100) # High resilience
        sleep_avg = round(random.uniform(7.0, 9.0), 1)
        diagnosis = "Optimal Metabolic Function"
        
        # Base Vitals
        base_glucose = random.randint(75, 90)
        base_insulin = random.uniform(2.0, 6.0)
        insulin_trend = 0.2 # Stable

    elif profile == "SILENT": # The Aegis Use Case
        age = random.randint(30, 55)
        health_score = random.randint(50, 75)
        cortisol = random.randint(18, 28) # High stress
        hrv = random.randint(30, 50) # Dropping resilience
        sleep_avg = round(random.uniform(5.5, 6.8), 1)
        diagnosis = "Pre-Diabetes & Adrenal Fatigue"
        
        # The Trap: Normal Glucose, Spiking Insulin
        base_glucose = random.randint(85, 95) 
        base_insulin = random.uniform(8.0, 12.0)
        insulin_trend = 3.5 # Spiking rapidly

    else: # CHRONIC
        age = random.randint(45, 75)
        health_score = random.randint(20, 49)
        cortisol = random.randint(15, 25)
        hrv = random.randint(15, 30) # Very low
        sleep_avg = round(random.uniform(4.0, 6.0), 1)
        diagnosis = "Type 2 Diabetes / Hypertension"
        
        base_glucose = random.randint(110, 160)
        base_insulin = random.uniform(20.0, 35.0) # Insulin resistance burnout
        insulin_trend = 1.0

    # Add to Patient List
    patients.append([p_id, name, age, gender, health_score, cortisol, hrv, sleep_avg, diagnosis])

    # 2. GENERATE LONGITUDINAL VITALS (6 Months)
    curr_glucose = base_glucose
    curr_insulin = base_insulin
    
    for m in MONTHS:
        # Add random noise
        g_noise = random.randint(-3, 3)
        i_noise = random.uniform(-0.5, 0.5)
        
        # Apply trend
        curr_insulin += insulin_trend + i_noise
        curr_glucose += g_noise
        
        vitals_log.append([p_id, m, int(curr_glucose), round(curr_insulin, 1)])

# WRITE TO CSV
with open('backend/data/patients.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'name', 'age', 'gender', 'healthScore', 'cortisol', 'hrv', 'sleepAvg', 'diagnosis'])
    writer.writerows(patients)

with open('backend/data/vitals.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['patient_id', 'month', 'glucose', 'insulin'])
    writer.writerows(vitals_log)

print("✅ Data Generation Complete.")
print(f"   - Created backend/data/patients.csv ({NUM_PATIENTS} rows)")
print(f"   - Created backend/data/vitals.csv ({len(vitals_log)} rows)")