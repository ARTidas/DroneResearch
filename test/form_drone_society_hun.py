import time
import random
import pymysql
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# 1. SETUP
# ---------------------------------------------------------
try:
    import db_config
except ImportError:
    print("❌ Error: db_config.py not found.")
    exit()

TARGET_URL = "http://localhost/DroneResearch/form_drone_society/hun" 
NUMBER_OF_RESPONSES = 50  # How many surveys to submit?

# Browser Setup (Headless = faster)
options = webdriver.ChromeOptions()
# options.add_argument("--headless") 
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# 2. DATA GENERATORS
# ---------------------------------------------------------
COUNTRIES = ["Hungary", "Hungary", "Hungary", "Austria", "Germany", "Slovak Republic", "Romania"] # Weighted for Hungary
ZIPS_HUNGARY = ["1054", "1117", "4028", "3525", "6720", "7621", "9021"]
ZIPS_FOREIGN = ["1010", "80331", "1000", "01001"]

PROFESSIONS = ["Student", "Engineer", "Teacher", "Retired", "IT Specialist", "Doctor", "Driver", "Nurse"]
GENDERS = ["Male", "Female"]
EDUCATION_LEVELS = ["Secondary school", "Higher education", "Vocational school", "Academic degree"]

def get_random_zip(country):
    if country == "Hungary":
        return random.choice(ZIPS_HUNGARY)
    return random.choice(ZIPS_FOREIGN)

def fill_likert_scale(driver, question_name):
    """Randomly clicks 1-5, biased towards 3-5"""
    val = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 25, 35, 25])[0]
    driver.find_element(By.CSS_SELECTOR, f"input[name='{question_name}'][value='{val}']").click()

# 3. DATABASE VERIFICATION FUNCTION
# ---------------------------------------------------------
def verify_latest_submission(expected_age, expected_zip):
    try:
        conn = pymysql.connect(
            host=db_config.DB_HOST,
            user=db_config.DB_USER,
            password=db_config.DB_PASSWORD,
            database=db_config.DB_NAME
        )
        with conn.cursor() as cursor:
            # Check the very last entry
            sql = "SELECT age, postal_code, country FROM form_responses_drone_society_v2 ORDER BY submitted_at DESC LIMIT 1"
            cursor.execute(sql)
            result = cursor.fetchone()
            
            if result:
                db_age, db_zip, db_country = result
                # Compare (Note: DB might store int, Python string)
                if str(db_age) == str(expected_age) and str(db_zip) == str(expected_zip):
                    print(f"   ✅ DB Verified: Age {db_age}, Zip {db_zip}, Country {db_country}")
                    return True
                else:
                    print(f"   ❌ DB Mismatch! Expected {expected_age}/{expected_zip}, got {db_age}/{db_zip}")
                    return False
            else:
                print("   ❌ No data found in DB!")
                return False
    except Exception as e:
        print(f"   ⚠️ DB Connection Error: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

# 4. MAIN LOOP
# ---------------------------------------------------------
try:
    print(f"🚀 Starting Stress Test: {NUMBER_OF_RESPONSES} submissions...")
    
    for i in range(1, NUMBER_OF_RESPONSES + 1):
        driver.get(TARGET_URL)
        
        # --- A. Generate Data ---
        country = random.choice(COUNTRIES)
        zip_code = get_random_zip(country)
        age = random.randint(18, 75)
        prof = random.choice(PROFESSIONS)
        
        # --- B. Fill Form ---
        # Demographics
        driver.find_element(By.NAME, "age").send_keys(str(age))
        
        # Handle Country Select Logic
        Select(driver.find_element(By.ID, "countrySelector")).select_by_value(country)
        driver.find_element(By.ID, "zipInput").send_keys(zip_code)
        
        driver.find_element(By.NAME, "profession").send_keys(prof)
        Select(driver.find_element(By.NAME, "gender")).select_by_value(random.choice(GENDERS))
        Select(driver.find_element(By.NAME, "education")).select_by_value(random.choice(EDUCATION_LEVELS))
        Select(driver.find_element(By.NAME, "drone_familiarity")).select_by_value(str(random.randint(1, 4)))

        # Matrix Questions
        for q in ["S1","S2","S3","S4", "W1","W2","W3","W4", "O1","O2","O3","O4", "T1","T2","T3","T4"]:
            fill_likert_scale(driver, q)

        # Text
        driver.find_element(By.NAME, "biggest_fear_hope").send_keys(f"Automated Test #{i}")

        # --- C. Submit ---
        driver.find_element(By.NAME, "create").click()
        
        # --- D. Verification ---
        print(f"[{i}/{NUMBER_OF_RESPONSES}] Submitted ({country}, {age})...", end="")
        time.sleep(0.5) # Give PHP a moment to insert
        verify_latest_submission(age, zip_code)

    print("\n🎉 Stress Test Complete!")

except Exception as e:
    print(f"\n❌ Critical Failure: {e}")

finally:
    driver.quit()