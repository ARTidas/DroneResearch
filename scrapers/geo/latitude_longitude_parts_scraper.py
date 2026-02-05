import pandas as pd
from sqlalchemy import create_engine, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

# IMPORT YOUR SECRETS
try:
    import db_config
except ImportError:
    print("Error: db_config.py not found.")
    exit()

# 1. DATABASE CONNECTION
connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
db_connection = create_engine(connection_string)

# 2. SETUP GEOCODER
geolocator = Nominatim(user_agent="hungarian_settlement_parts_project")

def get_part_coordinates(part_name, settlement_name, county):
    """
    Tries to find a specific part of a settlement.
    """
    # 1. Try fully qualified: "Part, Settlement, County"
    query = f"{part_name}, {settlement_name}, {county}, Hungary"
    try:
        location = geolocator.geocode(query, timeout=10)
        
        # 2. If fail, try less specific: "Part, Settlement" (Sometimes County confuses OSM if the boundary is weird)
        if not location:
            query_simple = f"{part_name}, {settlement_name}, Hungary"
            location = geolocator.geocode(query_simple, timeout=10)

        if location:
            return location.latitude, location.longitude
        else:
            return None, None

    except GeocoderTimedOut:
        time.sleep(2)
        return get_part_coordinates(part_name, settlement_name, county)
    except Exception as e:
        print(f"Error: {e}")
        return None, None

# 3. SELECT TARGETS
# We exclude 'Külterület' because it's too generic to have a single point
print("Fetching parts to geocode...")
query = """
SELECT id, part_name, settlement_name, county 
FROM geo_hungary_settlement_parts 
WHERE latitude IS NULL 
  AND part_name NOT IN ('Külterület', 'Tanya', 'Lakott hely')
"""
df = pd.read_sql(query, db_connection)
print(f"Found {len(df)} specific parts to process.")

# 4. ITERATE
with db_connection.connect() as conn:
    for index, row in df.iterrows():
        lat, lon = get_part_coordinates(row['part_name'], row['settlement_name'], row['county'])
        
        if lat:
            stmt = text("""
                UPDATE geo_hungary_settlement_parts 
                SET latitude = :lat, longitude = :lon, updated_at = NOW() 
                WHERE id = :pid
            """)
            conn.execute(stmt, {"lat": lat, "lon": lon, "pid": row['id']})
            print(f"Found: {row['part_name']} ({row['settlement_name']}) -> {lat}, {lon}")
            conn.commit()
        else:
            print(f"Not found: {row['part_name']} ({row['settlement_name']})")
        
        # Respect API Rate Limits
        time.sleep(1.2) 

print("Settlement parts geocoding complete!")