import pandas as pd
from sqlalchemy import create_engine, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

# 1. SETUP
try:
    import db_config
except ImportError:
    print("❌ Error: db_config.py not found.")
    exit()

connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
db_engine = create_engine(connection_string)

geolocator = Nominatim(user_agent="budapest_district_fixer_v2")

# The "Generic" Budapest Center (Deák tér) - We want to avoid this!
GENERIC_LAT = 47.4979
GENERIC_LON = 19.0402

def get_budapest_coords(postal_code):
    try:
        # STRATEGY CHANGE: Use a STRING query (Unstructured)
        # This matches what you type in the OSM website search bar.
        query_string = f"{postal_code} Budapest, Hungary"
        
        location = geolocator.geocode(query_string, timeout=10)
        
        if location:
            # CHECK: Is this just the generic city center?
            # We use a small tolerance (0.0002) to detect if it's the exact center
            if abs(location.latitude - GENERIC_LAT) < 0.0002 and abs(location.longitude - GENERIC_LON) < 0.0002:
                # Try Alternative: Just the Zip Code + Hungary (sometimes 'Budapest' confuses strict boundaries)
                query_alt = f"{postal_code}, Hungary"
                location_alt = geolocator.geocode(query_alt, timeout=10)
                
                if location_alt and (abs(location_alt.latitude - GENERIC_LAT) > 0.0002):
                     return location_alt.latitude, location_alt.longitude
                
                return None, None # Still generic, so we consider it "Not Found" rather than "Wrong"
            
            return location.latitude, location.longitude
        else:
            return None, None

    except GeocoderTimedOut:
        time.sleep(2)
        return get_budapest_coords(postal_code)
    except Exception as e:
        print(f"   Error: {e}")
        return None, None

def main():
    print("🔍 Loading Budapest postal codes (1XXX)...")
    
    # Select all 1xxx codes to re-verify them
    sql = """
    SELECT postal_code 
    FROM 02773_research.geo_hungary_postal_codes_aggregated 
    WHERE postal_code LIKE '1%%' 
    AND LENGTH(postal_code) = 4
    """
    
    df = pd.read_sql(sql, db_engine)
    print(f"🚀 Processing {len(df)} Budapest districts...")

    with db_engine.connect() as conn:
        for index, row in df.iterrows():
            zip_code = row['postal_code']
            
            lat, lon = get_budapest_coords(zip_code)
            
            if lat:
                print(f"[{index+1}/{len(df)}] ✅ {zip_code}: {lat:.5f}, {lon:.5f}")
                
                update_sql = text("""
                    UPDATE 02773_research.geo_hungary_postal_codes_aggregated 
                    SET latitude = :lat, longitude = :lon, updated_at = NOW() 
                    WHERE postal_code = :zip
                """)
                conn.execute(update_sql, {"lat": lat, "lon": lon, "zip": zip_code})
                conn.commit()
            else:
                print(f"[{index+1}/{len(df)}] ⚠️  Skipped (Generic Center or Not Found): {zip_code}")

            time.sleep(1.2) # Keeping safe rate limit

    print("🎉 Budapest geocoding complete!")

if __name__ == "__main__":
    main()