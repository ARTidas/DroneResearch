<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class SwotSplitsDao extends AbstractDao {

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				SELECT
                    `RESPONSES`.`age` AS `age`,
                    IF(`RESPONSES`.`age` > 76.64 / 2,'Older','Younger') AS `age_group`,
                    `RESPONSES`.`postal_code` AS `responder_postal_code`,
                    `RESPONSES`.`profession` AS `profession`,
                    `GEO_SETTLEMENTS`.`type` AS `geo_responder_settlement_type`,
                    IF(`GEO_SETTLEMENTS`.`type` like '%község%','Rural','Urban') AS `settlement_group`,
                    `GEO_SETTLEMENTS`.`latitude` AS `geo_responder_settlement_latitude`,
                    `GEO_SETTLEMENTS`.`longitude` AS `geo_responder_settlement_longitude`,
                    CASE `RESPONSES`.`gender` 
                        WHEN 'Nő' THEN 'Female'
                        WHEN 'Férfi' THEN 'Male'
                        ELSE 'ERROR' 
                    END AS `gender`,
                    CASE `RESPONSES`.`education`
                        WHEN 'Általános iskola' THEN 'Primary school'
                        WHEN 'Szakiskola / Szakmunkásképző' THEN 'Vocational school'
                        WHEN 'Érettségi (középiskola)' THEN 'Secondary school'
                        WHEN 'Felsőfokú végzettség (diploma, BSc/BA, MSc/MA)' THEN 'Higher education'
                        WHEN 'Tudományos fokozat (PhD, DLA)' THEN 'Academic degree'
                        ELSE 'ERROR'
                    END AS `education`,
                    CASE `RESPONSES`.`drone_familiarity`
                        WHEN 'Soha nem találkoztam / nem foglalkoztam velük' THEN '1' 
                        WHEN 'Láttam már, vagy hallottam róluk a médiában / környezetemben' THEN '2' 
                        WHEN 'Kezeltem már drónt rövidebb ideig (pl. ismerősnél)' THEN '3' 
                        WHEN 'Rendszeresen használok drónt (pl. hobby vagy munka céljából)' THEN '4' 
                        ELSE 'ERROR' 
                    END AS `drone_familiarity`,
                    CASE `RESPONSES`.`drone_familiarity` 
                        WHEN 'Soha nem találkoztam / nem foglalkoztam velük' THEN 'Less' 
                        WHEN 'Láttam már, vagy hallottam róluk a médiában / környezetemben' THEN 'Less' 
                        WHEN 'Kezeltem már drónt rövidebb ideig (pl. ismerősnél)' THEN 'More' 
                        WHEN 'Rendszeresen használok drónt (pl. hobby vagy munka céljából)' THEN 'More' 
                        ELSE 'ERROR' 
                    END AS `drone_familiarity_group`,
                    `RESPONSES`.`S1` AS `S1`,`RESPONSES`.`S2` AS `S2`,`RESPONSES`.`S3` AS `S3`,`RESPONSES`.`S4` AS `S4`,
                    `RESPONSES`.`O1` AS `O1`,`RESPONSES`.`O2` AS `O2`,`RESPONSES`.`O3` AS `O3`,`RESPONSES`.`O4` AS `O4`,
                    `RESPONSES`.`W1` AS `W1`,`RESPONSES`.`W2` AS `W2`,`RESPONSES`.`W3` AS `W3`,`RESPONSES`.`W4` AS `W4`,
                    `RESPONSES`.`T1` AS `T1`,`RESPONSES`.`T2` AS `T2`,`RESPONSES`.`T3` AS `T3`,`RESPONSES`.`T4` AS `T4` 
                FROM (
                    `02773_research`.`form_responses_drone_society` `RESPONSES` 
                        LEFT JOIN (
                            SELECT
                                `SUB_GEO_SETTLEMENTS`.`postal_code` AS `postal_code`,
                                GROUP_CONCAT(DISTINCT `SUB_GEO_SETTLEMENTS`.`type` SEPARATOR ',') AS `type`,
                                ROUND(AVG(`SUB_GEO_SETTLEMENTS`.`latitude`), 4) AS `latitude`,
                                ROUND(AVG(`SUB_GEO_SETTLEMENTS`.`longitude`), 4) AS `longitude` 
                            FROM
                                `02773_research`.`geo_hungary_settlements` `SUB_GEO_SETTLEMENTS` 
                            GROUP BY
                                `SUB_GEO_SETTLEMENTS`.`postal_code` 
                            ORDER BY
                                `SUB_GEO_SETTLEMENTS`.`type`
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
                    `RESPONSES`.`age` > 17
            ;";

			try {
				$handler = ($this->database_connection_bo)->getConnection();
				$statement = $handler->prepare($query_string);
				$statement->execute();
				
				return $statement->fetchAll(PDO::FETCH_ASSOC);
			}
			catch(Exception $exception) {
				LogHelper::addError('Error: ' . $exception->getMessage());

				return false;
			}
		}

		
	}
?>
