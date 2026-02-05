CREATE TABLE geo_hungary_settlements_v2 (
    -- Primary Identifiers
    ksh_id VARCHAR(10) PRIMARY KEY,          -- Stored as string to preserve leading zeros
    settlement_name VARCHAR(255) NOT NULL,
    settlement_type VARCHAR(50),             -- e.g. 'község', 'város'

    -- Administrative Hierarchy
    county VARCHAR(100),                     -- Vármegye
    district VARCHAR(100),                   -- Járás neve
    district_code VARCHAR(10),
    district_seat VARCHAR(255),

    -- Municipal Authority Info
    authority_code VARCHAR(10),              -- Polgármesteri hivatal kódja
    authority_seat VARCHAR(255),             -- Where the office is physically located

    -- Demographics & Geography
    area_hectares INT,                       -- Terület
    population INT,                          -- Lakónépesség
    dwellings_count INT,                     -- Lakások száma
    is_area_estimated BOOLEAN DEFAULT FALSE, -- Becsült terület?

    -- Minority Self-Governments (Nemzetiségi önkormányzatok)
    -- Using BOOLEAN to indicate presence
    has_minority_gov_bulgarian BOOLEAN DEFAULT FALSE,
    has_minority_gov_greek BOOLEAN DEFAULT FALSE,
    has_minority_gov_croatian BOOLEAN DEFAULT FALSE,
    has_minority_gov_polish BOOLEAN DEFAULT FALSE,
    has_minority_gov_german BOOLEAN DEFAULT FALSE,
    has_minority_gov_armenian BOOLEAN DEFAULT FALSE,
    has_minority_gov_roma BOOLEAN DEFAULT FALSE,
    has_minority_gov_romanian BOOLEAN DEFAULT FALSE,
    has_minority_gov_ruthenian BOOLEAN DEFAULT FALSE,
    has_minority_gov_serbian BOOLEAN DEFAULT FALSE,
    has_minority_gov_slovak BOOLEAN DEFAULT FALSE,
    has_minority_gov_slovenian BOOLEAN DEFAULT FALSE,
    has_minority_gov_ukrainian BOOLEAN DEFAULT FALSE
);
CREATE TABLE 02773_research.geo_hungary_settlement_parts (
    id SERIAL PRIMARY KEY,
    ksh_id VARCHAR(10) NOT NULL,             -- Foreign Key to hungarian_settlements
    settlement_name VARCHAR(255),            -- Redundant, but useful for verification
    county VARCHAR(100),
    
    part_name VARCHAR(255) NOT NULL,         -- Településrész megnevezése
    part_type_code VARCHAR(5),               -- 00=Central, 01=Internal, 02=Outskirts
    postal_code VARCHAR(10),
    
    -- Classification for outskirts (e.g., 'Lh.' = Lakott hely, 'Mgl.' = Mezőgazdasági)
    external_part_classification VARCHAR(50), 
    
    distance_from_center_km DECIMAL(5,1),    -- Distance in km
    population INT DEFAULT 0,                -- Népszámlálási lakónépesség
    dwellings_count INT DEFAULT 0,           -- Lakások száma
    other_occupied_units INT DEFAULT 0       -- Lakott egyéb lakóegységek
    
    -- Index for faster joins
    -- INDEX idx_ksh_id (ksh_id),
    -- FOREIGN KEY (ksh_id) REFERENCES hungarian_settlements(ksh_id) ON DELETE CASCADE
);





LOAD DATA LOCAL INFILE 'C:/Users/Admin/Downloads/hnt_letoltes_2025_helysegek.csv'
INTO TABLE `02773_research`.geo_hungary_settlements_v2
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 3 LINES
(
    settlement_name,
    ksh_id,
    settlement_type,
    county,
    district_code,
    district,
    district_seat,
    authority_code,
    authority_seat,
    @var_area,            -- Load into variable first to clean formatting
    @var_population,
    @var_dwellings,
    @var_est_area,        -- Flag column
    @var_bulgar,          -- Start of minority flags
    @var_greek,
    @var_croat,
    @var_polish,
    @var_german,
    @var_armenian,
    @var_roma,
    @var_romanian,
    @var_ruthenian,
    @var_serb,
    @var_slovak,
    @var_slovene,
    @var_ukrain
)
SET 
    -- Clean numbers: Remove spaces (thousands separators) if present
    area_hectares = NULLIF(REPLACE(@var_area, ' ', ''), ''),
    population = NULLIF(REPLACE(@var_population, ' ', ''), ''),
    dwellings_count = NULLIF(REPLACE(@var_dwellings, ' ', ''), ''),
    
    -- Convert Text/Flags to Boolean (1 or 0)
    is_area_estimated = IF(TRIM(@var_est_area) != '', 1, 0),
    
    has_minority_gov_bulgarian = IF(TRIM(@var_bulgar) != '', 1, 0),
    has_minority_gov_greek     = IF(TRIM(@var_greek) != '', 1, 0),
    has_minority_gov_croatian  = IF(TRIM(@var_croat) != '', 1, 0),
    has_minority_gov_polish    = IF(TRIM(@var_polish) != '', 1, 0),
    has_minority_gov_german    = IF(TRIM(@var_german) != '', 1, 0),
    has_minority_gov_armenian  = IF(TRIM(@var_armenian) != '', 1, 0),
    has_minority_gov_roma      = IF(TRIM(@var_roma) != '', 1, 0),
    has_minority_gov_romanian  = IF(TRIM(@var_romanian) != '', 1, 0),
    has_minority_gov_ruthenian = IF(TRIM(@var_ruthenian) != '', 1, 0),
    has_minority_gov_serbian   = IF(TRIM(@var_serb) != '', 1, 0),
    has_minority_gov_slovak    = IF(TRIM(@var_slovak) != '', 1, 0),
    has_minority_gov_slovenian = IF(TRIM(@var_slovene) != '', 1, 0),
    has_minority_gov_ukrainian = IF(TRIM(@var_ukrain) != '', 1, 0)
;





LOAD DATA LOCAL INFILE 'C:/Users/Admin/Downloads/hnt_letoltes_2025_telepulesreszek.csv'
INTO TABLE `02773_research`.geo_hungary_settlement_parts
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 3 LINES  -- Skips the title rows and the header row
(
    ksh_id,
    settlement_name,
    county,
    part_name,
    part_type_code,
    postal_code,
    external_part_classification,
    @var_distance,
    @var_population,
    @var_dwellings,
    @var_other_units
)
SET 
    -- Handle empty strings and commas in numbers
    distance_from_center_km = NULLIF(@var_distance, ''),
    population              = NULLIF(REPLACE(@var_population, ',', ''), ''),
    dwellings_count         = NULLIF(REPLACE(@var_dwellings, ',', ''), ''),
    other_occupied_units    = NULLIF(REPLACE(@var_other_units, ',', ''), '')
;