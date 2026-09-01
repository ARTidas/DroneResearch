CREATE TABLE 02773_research.form_responses_drone_reservists_v1 (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `submitted_at` datetime,
    `age` INT,
    `gender` VARCHAR(50),
    `postal_code` INT,
    `education` VARCHAR(255),
    `years_of_service` INT,
    `rank` VARCHAR(255),
    `drone_familiarity` VARCHAR(255),
    `labor_market_status` VARCHAR(255),
    `income_net` INT,
    `employer_size` VARCHAR(255),
    `employment_ownership` VARCHAR(255),
    `employer_form` VARCHAR(255),
    `S1` INT,
    `S2` INT,
    `S3` INT,
    `S4` INT,
    `W1` INT,
    `W2` INT,
    `W3` INT,
    `W4` INT,
    `O1` INT,
    `O2` INT,
    `O3` INT,
    `O4` INT,
    `T1` INT,
    `T2` INT,
    `T3` INT,
    `T4` INT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SELECT
	RESPONSES.age,
    RESPONSES.gender,
    RESPONSES.postal_code,
    SETTLEMENTS.category AS settlement_category,
    SETTLEMENTS.latitude AS `latitude`,
	SETTLEMENTS.longitude AS `longitude`,
    RESPONSES.education,
    RESPONSES.years_of_service,
    RESPONSES.`rank`,
    RESPONSES.drone_familiarity,
    CASE `RESPONSES`.`drone_familiarity` 
		WHEN 'Soha nem találkoztam / nem foglalkoztam velük' THEN 'Kevésbé' 
		WHEN 'Láttam már, vagy hallottam róluk a médiában / környezetemben' THEN 'Kevésbé' 
		WHEN 'Kezeltem már drónt rövidebb ideig (pl. ismerősnél)' THEN 'Többé' 
		WHEN 'Rendszeresen használok drónt (pl. hobby vagy munka céljából)' THEN 'Többé' 
		ELSE 'ERROR' 
	END AS `drone_familiarity_group`,
    RESPONSES.labor_market_status,
    RESPONSES.income_net,
    RESPONSES.employer_size,
    RESPONSES.employment_ownership,
    RESPONSES.employer_form,
    RESPONSES.S1, RESPONSES.S2, RESPONSES.S3, RESPONSES.S4, 
    RESPONSES.W1, RESPONSES.W2, RESPONSES.W3, RESPONSES.W4, 
    RESPONSES.O1, RESPONSES.O2, RESPONSES.O3, RESPONSES.O4, 
    RESPONSES.T1, RESPONSES.T2, RESPONSES.T3, RESPONSES.T4,
    ROUND((
		`RESPONSES`.`S1` + `RESPONSES`.`S2` + `RESPONSES`.`S3` + `RESPONSES`.`S4` +
        `RESPONSES`.`O1` + `RESPONSES`.`O2` + `RESPONSES`.`O3` + `RESPONSES`.`O4`
	) / 8, 4) AS 'SO_Attitude',
    ROUND((
		`RESPONSES`.`W1` + `RESPONSES`.`W2` + `RESPONSES`.`W3` + `RESPONSES`.`W4` +
        `RESPONSES`.`T1` + `RESPONSES`.`T2` + `RESPONSES`.`T3` + `RESPONSES`.`T4`
	) / 8, 4) AS 'WT_Attitude'
FROM
	02773_research.form_responses_drone_reservists_v1 RESPONSES
    LEFT JOIN 02773_research.geo_hungary_postal_codes_aggregated SETTLEMENTS
		ON RESPONSES.postal_code = SETTLEMENTS.postal_code
;

SELECT * 
FROM 02773_research.RESPONSES_drone_reservists_v1
INTO OUTFILE '/path/to/your/folder/drone_research_export.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';