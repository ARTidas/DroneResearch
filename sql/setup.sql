-- * ****************************************************
-- * *** Settlement level table creation ****************
-- * ****************************************************
CREATE TABLE 02773_research.geo_hungary_settlements (
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

-- * ****************************************************
-- * *** Settlement part level table creation ***********
-- * ****************************************************
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

-- * ****************************************************
-- * *** Postal code level table creation ***************
-- * ****************************************************
CREATE TABLE 02773_research.geo_hungary_postal_codes (
    id SERIAL PRIMARY KEY,
    postal_code VARCHAR(10) NOT NULL,           -- IRSZ
    settlement_name VARCHAR(100) NOT NULL,   -- Település (Deduced for cities)
    
    -- Sub-divisions
    part_name VARCHAR(100),                  -- Településrész / Városrész (e.g., "Kismacs")
    district_bp VARCHAR(20),                 -- KER (Only for Budapest, e.g., "XIV.")
    
    -- Street Details (Null for generic country data)
    street_name VARCHAR(255),                -- Utcanév / Címhely neve
    street_type VARCHAR(50),                 -- Utótag / Jellege (e.g., "út", "tér")
    
    -- House Number Ranges (For large streets with split zip codes)
    num_start VARCHAR(20),                   -- 1. Szám
    num_start_sign VARCHAR(10),              -- 1. Jel
    num_end VARCHAR(20),                     -- 2. Szám
    num_end_sign VARCHAR(10),                -- 2. Jel
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- * ****************************************************
-- * *** Postal code level aggregate table creation *****
-- * ****************************************************
CREATE TABLE 02773_research.geo_hungary_postal_codes_aggregated (
    -- The Primary Key
    postal_code VARCHAR(10) PRIMARY KEY,

    -- The Categorization (Our Goal)
    category VARCHAR(20),                -- 'Urban' or 'Rural'
    
    -- Core Location Details
    settlement_name VARCHAR(255),        -- Primary settlement name
    county VARCHAR(100),
    district VARCHAR(100),               -- Járás
    settlement_type VARCHAR(50),         -- The source of the categorization
    
    -- Aggregated Statistics
    population INT DEFAULT 0,            -- Population living specifically in this Zip
    settlement_total_pop INT,            -- Total population of the city/village
    
    -- Geospatial Center
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- * ****************************************************
-- * *** Load KSH data into settlement level table ******
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/hnt_letoltes_2025_helysegek.csv'
INTO TABLE `02773_research`.geo_hungary_settlements
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



-- * ****************************************************
-- * *** Load KSH data into settlement part level table *
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/hnt_letoltes_2025_telepulesreszek.csv'
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


-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_hungary.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code, 
    settlement_name, 
    part_name
);


-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Hungary *************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_hungary.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2  -- <--- THIS IS THE FIX
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code, 
    settlement_name, 
    part_name
);

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Budapest ************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_budapest.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign,
    district_bp
)
SET settlement_name = 'Budapest';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Debrecen ************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_debrecen.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Debrecen';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Gyor ****************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_gyor.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Győr';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Miskolc *************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_miskolc.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Miskolc';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Miskolc *************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_miskolc.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Miskolc';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Pecs ****************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_pecs.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Pécs';

-- * ****************************************************
-- * *** Load MP data into postal codes level table *****
-- * ****** Szeged **************************************
-- * ****************************************************
LOAD DATA LOCAL INFILE 'C:/wamp/www/DroneResearch/cdn/geo_data/Iranyitoszam-Internet_uj_szeged.csv'
INTO TABLE 02773_research.geo_hungary_postal_codes
CHARACTER SET latin2
FIELDS TERMINATED BY ';' 
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(
    postal_code,
    street_name,
    street_type,
    part_name,
    num_start,
    num_start_sign,
    num_end,
    num_end_sign
)
SET settlement_name = 'Szeged';







-- * ****************************************************
-- * *** Alter settlement and settlement parts tables ***
-- * ****** in order to hold latitude and longitude *****
-- * ****** level details and flag on last update tile **
-- * ****************************************************
ALTER TABLE 02773_research.geo_hungary_settlements
  ADD COLUMN latitude DECIMAL(10, 7),
  ADD COLUMN longitude DECIMAL(10, 7),
  ADD COLUMN updated_at TIMESTAMP
;
ALTER TABLE 02773_research.geo_hungary_settlement_parts
  ADD COLUMN latitude DECIMAL(10, 7),
  ADD COLUMN longitude DECIMAL(10, 7),
  ADD COLUMN updated_at TIMESTAMP
;
ALTER TABLE 02773_research.geo_hungary_postal_codes
	ADD COLUMN latitude DECIMAL(10, 7),
	ADD COLUMN longitude DECIMAL(10, 7)
;


-- * ****************************************************
-- * *** Save resources and fill in details *************
-- * ****************************************************
UPDATE 02773_research.geo_hungary_settlement_parts p
JOIN 02773_research.geo_hungary_settlements s ON p.ksh_id = s.ksh_id
SET 
    p.latitude = s.latitude,
    p.longitude = s.longitude,
    p.updated_at = NOW()
WHERE 
    p.part_type_code = '00'             -- 00 is always the center
    OR p.part_name = 'Központi belterület'
;


-- * ****************************************************
-- * *** Checking for errors ****************************
-- * ****** Quick fixes *********************************
-- * ****************************************************
SELECT * FROM 02773_research.geo_hungary_settlements WHERE settlement_name = 'Összesen';
DELETE FROM 02773_research.geo_hungary_settlements WHERE settlement_name = 'Összesen' LIMIT 1;
SELECT postal_code, COUNT(1) FROM 02773_research.geo_hungary_postal_codes GROUP BY 1 ORDER BY 2 DESC;
SELECT * FROM 02773_research.geo_hungary_postal_codes WHERE postal_code = '';
DELETE FROM 02773_research.geo_hungary_postal_codes WHERE postal_code = '';
SELECT * FROM 02773_research.geo_hungary_postal_codes WHERE postal_code = 4002;




-- * ****************************************************
-- * *** Creating the final aggregate table *************
-- * ****** Postal codes  *******************************
-- * ****************************************************
INSERT IGNORE INTO 02773_research.geo_hungary_postal_codes_aggregated (postal_code)
SELECT DISTINCT postal_code 
FROM 02773_research.geo_hungary_settlement_parts 
WHERE postal_code IS NOT NULL AND postal_code != '';

INSERT IGNORE INTO 02773_research.geo_hungary_postal_codes_aggregated (postal_code)
SELECT DISTINCT postal_code 
FROM 02773_research.geo_hungary_postal_codes 
WHERE postal_code IS NOT NULL AND postal_code != '';


UPDATE 02773_research.geo_hungary_postal_codes_aggregated target
JOIN (
    -- Grouping by postal code to pick the primary settlement details for each zip
    SELECT 
        p.postal_code, 
        s.settlement_name, 
        s.county, 
        s.district, 
        s.settlement_type,
        s.population as city_wide_pop
    FROM 02773_research.geo_hungary_settlement_parts p
    JOIN 02773_research.geo_hungary_settlements s ON p.ksh_id = s.ksh_id
    WHERE p.postal_code IS NOT NULL
    GROUP BY p.postal_code
) src ON target.postal_code = src.postal_code
SET 
    target.settlement_name = src.settlement_name,
    target.county = src.county,
    target.district = src.district,
    target.settlement_type = src.settlement_type,
    target.settlement_total_pop = src.city_wide_pop,
    
    -- SCIENTIFIC CLASSIFICATION LOGIC
    /*target.category = CASE 
        WHEN src.settlement_type LIKE '%Budapest%' THEN 'Urban'
        WHEN src.settlement_type LIKE '%város%' THEN 'Urban'  -- Covers 'megyei jogú város' too
        ELSE 'Rural'                                          -- Covers 'község', 'nagyközség'
    END*/
    target.category = CASE 
        WHEN src.settlement_type LIKE '%Budapest%' THEN 'Urban'
        WHEN src.settlement_type LIKE '%város%' THEN 'Urban'      -- Covers 'megyei jogú város' too
        WHEN src.settlement_type LIKE '%nagyközség%' THEN 'Urban' -- Covers 'nagyközség'
        ELSE 'Rural'                                              -- Covers 'község'
    END
;


UPDATE 02773_research.geo_hungary_postal_codes_aggregated target
JOIN (
    SELECT postal_code, SUM(population) as local_zip_pop
    FROM 02773_research.geo_hungary_settlement_parts
    WHERE postal_code IS NOT NULL
    GROUP BY postal_code
) src ON target.postal_code = src.postal_code
SET target.population = src.local_zip_pop;


UPDATE 02773_research.geo_hungary_postal_codes_aggregated target
JOIN (
    SELECT postal_code, AVG(latitude) as lat, AVG(longitude) as lon
    FROM 02773_research.geo_hungary_postal_codes
    WHERE latitude IS NOT NULL
    GROUP BY postal_code
) src ON target.postal_code = src.postal_code
SET target.latitude = src.lat, target.longitude = src.lon;


UPDATE 02773_research.geo_hungary_postal_codes_aggregated target
JOIN (
    SELECT postal_code, AVG(latitude) as lat, AVG(longitude) as lon
    FROM 02773_research.geo_hungary_settlement_parts
    WHERE latitude IS NOT NULL
    GROUP BY postal_code
) src ON target.postal_code = src.postal_code
SET target.latitude = src.lat, target.longitude = src.lon
WHERE target.latitude IS NULL; -- Only update if we didn't find street data




-- * ****************************************************
-- * *** Update postal codes by regex if not found ******
-- * ****************************************************
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Budapest' -- Join to get total population/county data
SET 
    t.settlement_name = 'Budapest',
    t.county = 'Budapest',
    t.category = 'Urban',
    t.settlement_type = 'főváros',
    t.settlement_total_pop = s.population,
    
    -- SMART DISTRICT EXTRACTION (Middle 2 digits -> Roman Numeral)
    t.district = CASE SUBSTRING(t.postal_code, 2, 2)
        WHEN '01' THEN 'I. kerület'
        WHEN '02' THEN 'II. kerület'
        WHEN '03' THEN 'III. kerület'
        WHEN '04' THEN 'IV. kerület'
        WHEN '05' THEN 'V. kerület'
        WHEN '06' THEN 'VI. kerület'
        WHEN '07' THEN 'VII. kerület'
        WHEN '08' THEN 'VIII. kerület'
        WHEN '09' THEN 'IX. kerület'
        WHEN '10' THEN 'X. kerület'
        WHEN '11' THEN 'XI. kerület'
        WHEN '12' THEN 'XII. kerület'
        WHEN '13' THEN 'XIII. kerület'
        WHEN '14' THEN 'XIV. kerület'
        WHEN '15' THEN 'XV. kerület'
        WHEN '16' THEN 'XVI. kerület'
        WHEN '17' THEN 'XVII. kerület'
        WHEN '18' THEN 'XVIII. kerület'
        WHEN '19' THEN 'XIX. kerület'
        WHEN '20' THEN 'XX. kerület'
        WHEN '21' THEN 'XXI. kerület'
        WHEN '22' THEN 'XXII. kerület'
        WHEN '23' THEN 'XXIII. kerület'
        WHEN '00' THEN 'Margitsziget' -- Special case (1007)
        ELSE 'Budapest'
    END
WHERE 
    t.postal_code LIKE '1%' 
    AND LENGTH(t.postal_code) = 4
    AND t.settlement_name IS NULL;

-- 1. DEBRECEN (Starts with 40..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Debrecen'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '40%' AND t.settlement_name IS NULL;

-- 2. MISKOLC (Starts with 35..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Miskolc'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '35%' AND t.settlement_name IS NULL;

-- 3. NYÍREGYHÁZA (Starts with 44..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Nyíregyháza'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '44%' AND t.settlement_name IS NULL;

-- 4. PÉCS (Starts with 76..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Pécs'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '76%' AND t.settlement_name IS NULL;

-- 5. SZEGED (Starts with 67..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Szeged'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '67%' AND t.settlement_name IS NULL;

-- 6. GYŐR (Starts with 90..)
UPDATE 02773_research.geo_hungary_postal_codes_aggregated t
JOIN 02773_research.geo_hungary_settlements s 
    ON s.settlement_name = 'Győr'
SET 
    t.settlement_name = s.settlement_name,
    t.county = s.county,
    t.district = s.district,
    t.settlement_type = s.settlement_type,
    t.settlement_total_pop = s.population,
    t.category = 'Urban'
WHERE t.postal_code LIKE '90%' AND t.settlement_name IS NULL;





-- * ****************************************************
-- * *** Population FIX/HACK ****************************
-- * ****************************************************
UPDATE 02773_research.geo_hungary_postal_codes_aggregated target
-- 1. Get the Total City Population
JOIN 02773_research.geo_hungary_settlements s 
    ON target.settlement_name = s.settlement_name
-- 2. Calculate the Ratio of streets for each Zip
JOIN (
    SELECT 
        raw.postal_code,
        raw.settlement_name,
        COUNT(*) as street_count,
        CityTotals.total_streets,
        (COUNT(*) / CityTotals.total_streets) as share_ratio
    FROM 02773_research.geo_hungary_postal_codes raw
    JOIN (
        -- Count total streets per city
        SELECT settlement_name, COUNT(*) as total_streets
        FROM 02773_research.geo_hungary_postal_codes
        GROUP BY settlement_name
    ) CityTotals ON raw.settlement_name = CityTotals.settlement_name
    GROUP BY raw.postal_code, raw.settlement_name
) Weights ON target.postal_code = Weights.postal_code
SET 
    -- 3. Apply the ratio to the total population
    target.population = ROUND(s.population * Weights.share_ratio),
    target.settlement_total_pop = s.population,
    target.updated_at = NOW()
WHERE 
    (target.population IS NULL OR target.population = 0)
    AND s.population > 0;








-- * ****************************************************
-- * *** Query statistics of the resulting table ********
-- * ****************************************************
SELECT 
    category, 
    COUNT(*) as postal_code_count, 
    FORMAT(SUM(population), 0) as total_population 
FROM 02773_research.geo_hungary_postal_codes_aggregated 
GROUP BY category;

SELECT
	settlement_type,
    COUNT(1) AS record_count
FROM 02773_research.geo_hungary_settlements
GROUP BY settlement_type
ORDER BY 2;

SELECT 
    category, 
    COUNT(1) AS postal_code_count, 
    FORMAT(SUM(population), 0) as total_population 
FROM 02773_research.geo_hungary_postal_codes_aggregated 
GROUP BY category;






-- * ****************************************************
-- * *** Questionnaire  ********
-- * ****************************************************
CREATE TABLE `02773_research`.`form_responses_drone_society_v2` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `submitted_at` datetime DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `country` varchar(256) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `profession` varchar(256) DEFAULT NULL,
  `gender` varchar(256) DEFAULT NULL,
  `education` varchar(256) DEFAULT NULL,
  `drone_familiarity` varchar(256) DEFAULT NULL,
  `S1` int(11) DEFAULT NULL,
  `S2` int(11) DEFAULT NULL,
  `S3` int(11) DEFAULT NULL,
  `S4` int(11) DEFAULT NULL,
  `W1` int(11) DEFAULT NULL,
  `W2` int(11) DEFAULT NULL,
  `W3` int(11) DEFAULT NULL,
  `W4` int(11) DEFAULT NULL,
  `O1` int(11) DEFAULT NULL,
  `O2` int(11) DEFAULT NULL,
  `O3` int(11) DEFAULT NULL,
  `O4` int(11) DEFAULT NULL,
  `T1` int(11) DEFAULT NULL,
  `T2` int(11) DEFAULT NULL,
  `T3` int(11) DEFAULT NULL,
  `T4` int(11) DEFAULT NULL,
  `biggest_fear_hope` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=257 DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;









-- * ****************************************************
-- * *** Query result with questionnaire details ********
-- * ****************************************************
SELECT
	`RESPONSES`.`postal_code`,
  `GEO_SETTLEMENTS`.*
FROM (
	`02773_research`.`form_responses_drone_society` `RESPONSES` 
		LEFT JOIN (
			SELECT
				SUB_GEO_SETTLEMENT_PARTS.postal_code AS postal_code,
				GROUP_CONCAT(DISTINCT SUB_GEO_SETTLEMENTS.settlement_type SEPARATOR ',') AS type,
				ROUND(AVG(SUB_GEO_SETTLEMENT_PARTS.latitude), 4) AS latitude,
				ROUND(AVG(SUB_GEO_SETTLEMENT_PARTS.longitude), 4) AS longitude
			FROM
				02773_research.geo_hungary_settlements SUB_GEO_SETTLEMENTS
				INNER JOIN 02773_research.geo_hungary_settlement_parts SUB_GEO_SETTLEMENT_PARTS
					ON SUB_GEO_SETTLEMENTS.ksh_id = SUB_GEO_SETTLEMENT_PARTS.ksh_id
			GROUP BY
				SUB_GEO_SETTLEMENT_PARTS.postal_code
		) `GEO_SETTLEMENTS` 
		ON (
			`GEO_SETTLEMENTS`.`postal_code` = IF(
				LEFT(`RESPONSES`.`postal_code`,1) = 1, 
				1000,
				`RESPONSES`.`postal_code`
			)
		)
) 
WHERE
	`RESPONSES`.`postal_code` NOT IN ('1040 Wien','07634','Külföld') AND 
	`RESPONSES`.`gender` NOT IN ('Húsos fagyi','') AND 
	`RESPONSES`.`postal_code` > 0 AND 
	`RESPONSES`.`age` > 17 AND
  `GEO_SETTLEMENTS`.`postal_code` IS NULL
;



-- * ****************************************************
-- * *** H1 hypothesis **********************************
-- * ****************************************************
SELECT
	CASE `RESPONSES`.`drone_familiarity` 
		WHEN 'Soha nem találkoztam / nem foglalkoztam velük' THEN 'Less' 
		WHEN 'Láttam már, vagy hallottam róluk a médiában / környezetemben' THEN 'Less' 
		WHEN 'Kezeltem már drónt rövidebb ideig (pl. ismerősnél)' THEN 'More' 
		WHEN 'Rendszeresen használok drónt (pl. hobby vagy munka céljából)' THEN 'More' 
		ELSE 'ERROR' 
	END AS `drone_familiarity_group`,
    ROUND((
		`RESPONSES`.`S1` + `RESPONSES`.`S2` + `RESPONSES`.`S3` + `RESPONSES`.`S4` +
        `RESPONSES`.`O1` + `RESPONSES`.`O2` + `RESPONSES`.`O3` + `RESPONSES`.`O4`
	) / 8, 4) AS 'SO_Attitude',
    ROUND((
		`RESPONSES`.`W1` + `RESPONSES`.`W2` + `RESPONSES`.`W3` + `RESPONSES`.`W4` +
        `RESPONSES`.`T1` + `RESPONSES`.`T2` + `RESPONSES`.`T3` + `RESPONSES`.`T4`
	) / 8, 4) AS 'WT_Attitude'
FROM 
	`02773_research`.`form_responses_drone_society` `RESPONSES` 
	LEFT JOIN `02773_research`.`geo_hungary_postal_codes_aggregated` `GEO_SETTLEMENTS`
		ON `RESPONSES`.`postal_code` = `GEO_SETTLEMENTS`.`postal_code`
WHERE
	`RESPONSES`.`postal_code` NOT IN ('1040 Wien','07634','Külföld') AND 
	`RESPONSES`.`gender` NOT IN ('Húsos fagyi','') AND 
	`RESPONSES`.`postal_code` > 0 AND 
	`RESPONSES`.`age` > 17
;