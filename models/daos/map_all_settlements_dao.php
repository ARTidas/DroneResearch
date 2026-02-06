<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class MapAllSettlementsDao extends AbstractDao {

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				SELECT
                    postal_code AS postal_code,
                    GROUP_CONCAT(DISTINCT SUB_GEO_SETTLEMENTS.settlement_type SEPARATOR ',') AS type,
                    ROUND(AVG(SUB_GEO_SETTLEMENT_PARTS.latitude), 4) AS latitude,
                    ROUND(AVG(SUB_GEO_SETTLEMENT_PARTS.longitude), 4) AS longitude,
                    ROUND(AVG(SUB_GEO_SETTLEMENTS.population), 0) AS population
                FROM
                    02773_research.geo_hungary_settlements SUB_GEO_SETTLEMENTS
                    INNER JOIN 02773_research.geo_hungary_settlement_parts SUB_GEO_SETTLEMENT_PARTS
                        ON SUB_GEO_SETTLEMENTS.ksh_id = SUB_GEO_SETTLEMENT_PARTS.ksh_id
                WHERE
                    SUB_GEO_SETTLEMENT_PARTS.latitude IS NOT NULL AND
                    SUB_GEO_SETTLEMENT_PARTS.longitude IS NOT NULL
                GROUP BY
                    postal_code
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
