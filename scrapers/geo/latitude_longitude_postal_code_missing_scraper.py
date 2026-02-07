import pandas as pd
from sqlalchemy import create_engine, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import time

# 1. SETUP & CREDENTIALS
# ---------------------------------------------------------
try:
    import db_config
except ImportError:
    print("Error: db_config.py not found. Please create it with your DB credentials.")
    exit()

# Connect to database
connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
db_engine = create_engine(connection_string)

# Initialize Nominatim API
# IMPORTANT: Replace 'hungarian_project' with your actual project name/email to be polite to OSM
geolocator = Nominatim(user_agent="hungarian_thesis_project_postal_filler")

# 2. GEOCODING FUNCTION
# ---------------------------------------------------------
def get_zip_coords(postal_code):
    """
    Queries OSM for a specific Hungarian postal code.
    Returns (lat, lon) or (None, None).
    """
    try:
        # Structured query is safer than string concatenation
        location = geolocator.geocode(
            {"postalcode": postal_code, "country": "Hungary"}, 
            timeout=10
        )
        
        if location:
            return location.latitude, location.longitude
        else:
            print(f"OSM did not find: {postal_code}")
            return None, None

    except (GeocoderTimedOut, GeocoderUnavailable):
        print(f"Timeout for {postal_code}, retrying in 3s...")
        time.sleep(3)
        return get_zip_coords(postal_code)
    except Exception as e:
        print(f"Error for {postal_code}: {e}")
        return None, None

# 3. MAIN LOOP
# ---------------------------------------------------------
def main():
    print("Fetching postal codes with missing coordinates...")
    
    # Select only what we need
    sql = """
    SELECT postal_code 
    FROM 02773_research.geo_hungary_postal_codes_aggregated 
    WHERE latitude IS NULL OR longitude IS NULL
    """
    
    df = pd.read_sql(sql, db_engine)
    total_count = len(df)
    print(f"Found {total_count} missing entries.")

    if total_count == 0:
        print("No missing coordinates found. Exiting.")
        return

    print("Starting geocoding... (Press Ctrl+C to stop safely)")

    # Establish a connection for updates
    with db_engine.connect() as conn:
        for index, row in df.iterrows():
            zip_code = row['postal_code']
            
            # 1. Get Coordinates
            lat, lon = get_zip_coords(zip_code)
            
            # 2. Update Database if found
            if lat:
                update_sql = text("""
                    UPDATE 02773_research.geo_hungary_postal_codes_aggregated 
                    SET latitude = :lat, longitude = :lon, updated_at = NOW() 
                    WHERE postal_code = :zip
                """)
                
                conn.execute(update_sql, {"lat": lat, "lon": lon, "zip": zip_code})
                conn.commit() # Commit immediately to save progress
                
                print(f"[{index+1}/{total_count}] Updated {zip_code} -> {lat:.5f}, {lon:.5f}")
            else:
                print(f"[{index+1}/{total_count}] Skipped {zip_code}")

            # 3. RATE LIMITING (Crucial!)
            # OSM policy requires max 1 request per second. We wait 1.1s to be safe.
            time.sleep(1.1)

    print("\nProcess complete!")

if __name__ == "__main__":
    main()