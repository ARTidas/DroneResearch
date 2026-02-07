import time
from sqlalchemy import create_engine, text

# IMPORT YOUR SECRETS
try:
    import db_config
except ImportError:
    print("Error: db_config.py not found.")
    exit()

# 1. CONNECT
connection_string = f"mysql+pymysql://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}/{db_config.DB_NAME}"
engine = create_engine(connection_string)

# 2. CONFIGURATION
BATCH_SIZE = 2000  # Process 2000 rows at a time
TABLE_NAME = "02773_research.geo_hungary_postal_codes"

print("Starting batched update...")

with engine.connect() as conn:
    # 3. GET ID RANGE
    # We find the min and max ID to know where to start and end
    range_result = conn.execute(text(f"SELECT MIN(id), MAX(id) FROM {TABLE_NAME}"))
    min_id, max_id = range_result.fetchone()
    
    if min_id is None:
        print("Table is empty!")
        exit()

    print(f"Processing IDs from {min_id} to {max_id}...")

    # 4. LOOP THROUGH BATCHES
    current_start = min_id
    
    while current_start <= max_id:
        current_end = current_start + BATCH_SIZE
        
        # --- QUERY A: PRECISE MATCH (Settlement + Part Name) ---
        # Matches "Debrecen" + "Kismacs" to get exact coordinates
        sql_parts = text(f"""
            UPDATE {TABLE_NAME} target
            JOIN 02773_research.geo_hungary_settlement_parts source 
              ON target.settlement_name = source.settlement_name 
              AND target.part_name = source.part_name
            SET 
                target.latitude = source.latitude, 
                target.longitude = source.longitude
            WHERE target.id >= :start_id AND target.id < :end_id
              AND source.latitude IS NOT NULL
        """)
        
        # --- QUERY B: FALLBACK MATCH (Settlement Name Only) ---
        # Matches "Debrecen" center for generic street addresses
        sql_city = text(f"""
            UPDATE {TABLE_NAME} target
            JOIN 02773_research.geo_hungary_settlements source 
              ON target.settlement_name = source.settlement_name
            SET 
                target.latitude = source.latitude, 
                target.longitude = source.longitude
            WHERE target.id >= :start_id AND target.id < :end_id
              AND target.latitude IS NULL  -- Only fill if Query A didn't write anything
              AND source.latitude IS NOT NULL
        """)

        try:
            # Run the precise update
            res_a = conn.execute(sql_parts, {"start_id": current_start, "end_id": current_end})
            
            # Run the fallback update
            res_b = conn.execute(sql_city, {"start_id": current_start, "end_id": current_end})
            
            conn.commit() # Save this batch
            
            print(f"Batch {current_start}-{current_end}: Parts matched: {res_a.rowcount}, Cities matched: {res_b.rowcount}")
            
        except Exception as e:
            print(f"Error in batch {current_start}: {e}")
        
        # Move to next batch
        current_start += BATCH_SIZE
        
        # Tiny pause to prevent database lockups
        time.sleep(0.1)

print("Update complete!")