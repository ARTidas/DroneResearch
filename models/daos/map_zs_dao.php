<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class MapZsDao extends AbstractDao {

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				SELECT
					data_list.city_name AS `city_name`,          -- A te listádból a név
					data_list.postal_code AS `postal_code`,      -- Az irányítószám
					data_list.send_count AS `send_count`,        -- A kiküldések száma
					ROUND(AVG(geo.latitude), 4) AS `latitude`,   -- Koordináták az adatbázisból
					ROUND(AVG(geo.longitude), 4) AS `longitude`
				FROM
					(
						-- Itt definialjuk a sajat adataidat egy virtualis tablakent
						SELECT 'Vámosújfalu' AS city_name, 3941 AS postal_code, 5 AS send_count UNION ALL
						SELECT 'Bodrogkeresztúr', 3916, 6 UNION ALL
						SELECT 'Tolcsva', 3934, 16 UNION ALL
						SELECT 'Sárospatak', 3950, 25 UNION ALL
						SELECT 'Szerencs', 3900, 11 UNION ALL
						SELECT 'Tarcal', 3915, 10 UNION ALL
						SELECT 'Tokaj', 3910, 13 UNION ALL
						SELECT 'Sátoraljaújhely', 3980, 12
					) AS data_list
				JOIN
					`02773_research`.`geo_hungary_settlements` AS geo 
					ON data_list.postal_code = geo.postal_code
				GROUP BY
					data_list.city_name,
					data_list.postal_code,
					data_list.send_count
				;
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
