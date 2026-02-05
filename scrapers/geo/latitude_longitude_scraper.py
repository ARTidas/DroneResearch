import pandas as pd
from sqlalchemy import create_engine, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time

# IMPORT YOUR SECRETS
try:
    import db_config
except ImportError:
    print("Error: db_config.py not found. Please create it with your database credentials.")
    exit()

# 1. DATABASE CONNECTION
# We use an f-string to inject the variables from the config file
connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
db_connection = create_engine(connection_string)

# 2. SETUP GEOCODER
geolocator = Nominatim(user_agent="thesis_project_hungarian_settlements")

def get_coordinates(settlement, county):
    """
    Fetches coordinates with error handling and retries.
    """
    try:
        # Construct query: "Settlement, County, Hungary"
        query = f"{settlement}, {county}, Hungary"
        location = geolocator.geocode(query, timeout=10)
        
        if location:
            return location.latitude, location.longitude
        else:
            print(f"Not found: {query}")
            return None, None
            
    except GeocoderTimedOut:
        print(f"Timeout for {query}, retrying...")
        time.sleep(2)
        return get_coordinates(settlement, county)
    except Exception as e:
        print(f"Error for {query}: {e}")
        return None, None

# 3. LOAD DATA
print("Loading settlements without coordinates...")
# Read existing data
df = pd.read_sql("SELECT ksh_id, settlement_name, county FROM geo_hungary_settlements WHERE latitude IS NULL", db_connection)
print(f"Found {len(df)} settlements to process.")

# 4. ITERATE AND UPDATE
with db_connection.connect() as conn:
    for index, row in df.iterrows():
        lat, lon = get_coordinates(row['settlement_name'], row['county'])
        
        if lat:
            stmt = text("""
                UPDATE geo_hungary_settlements 
                SET latitude = :lat, longitude = :lon
                WHERE ksh_id = :kid
            """)
            conn.execute(stmt, {"lat": lat, "lon": lon, "kid": row['ksh_id']})
            print(f"Updated: {row['settlement_name']} ({lat}, {lon})")
            
            conn.commit()
        
        # Respect API Rate Limits (1 request per second)
        time.sleep(1.1) 

print("Geocoding complete!")