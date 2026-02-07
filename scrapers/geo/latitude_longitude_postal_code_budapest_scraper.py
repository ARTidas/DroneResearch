import pandas as pd
from sqlalchemy import create_engine, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

# 1. SETUP
try:
    import db_config
except ImportError:
    print("Error: db_config.py not found.")
    exit()

connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
db_engine = create_engine(connection_string)

# Use a specific user agent for this task
geolocator = Nominatim(user_agent="budapest_district_geocoder_thesis")

# 2. FUNCTION TO GET COORDINATES
def get_budapest_coords(postal_code):
    try:
        # STRATEGY: 
        # Budapest zips are unique (1xxx). 
        # We query strictly by Postal Code + City to force District-level resolution.
        query = {"postalcode": postal_code, "city": "Budapest", "country": "Hungary"}
        
        location = geolocator.geocode(query, timeout=10)
        
        if location:
            return location.latitude, location.longitude
        else:
            return None, None

    except GeocoderTimedOut:
        time.sleep(2)
        return get_budapest_coords(postal_code)
    except Exception as e:
        print(f"   Error: {e}")
        return None, None

# 3. MAIN LOOP
def main():
    print("Loading Budapest postal codes (1XXX)...")
    
    # --- THE FIX IS HERE ---
    # We use '1%%' instead of '1%' because Python/SQLAlchemy treats single % as a variable placeholder.
    sql = """
    SELECT postal_code 
    FROM 02773_research.geo_hungary_postal_codes_aggregated 
    WHERE postal_code LIKE '1%%' 
    AND LENGTH(postal_code) = 4
    """
    
    df = pd.read_sql(sql, db_engine)
    print(f"Processing {len(df)} Budapest districts/zones...")

    with db_engine.connect() as conn:
        for index, row in df.iterrows():
            zip_code = row['postal_code']
            
            lat, lon = get_budapest_coords(zip_code)
            
            if lat:
                # Check if this is significantly different from the generic Budapest center
                print(f"[{index+1}/{len(df)}] {zip_code}: {lat:.5f}, {lon:.5f}")
                
                update_sql = text("""
                    UPDATE 02773_research.geo_hungary_postal_codes_aggregated 
                    SET latitude = :lat, longitude = :lon, updated_at = NOW() 
                    WHERE postal_code = :zip
                """)
                conn.execute(update_sql, {"lat": lat, "lon": lon, "zip": zip_code})
                conn.commit()
            else:
                print(f"[{index+1}/{len(df)}] Not found: {zip_code}")

            # Sleep to respect OSM policy
            time.sleep(1.1)

    print("Budapest geocoding complete!")

if __name__ == "__main__":
    main()