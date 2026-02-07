<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class MapAllPostalCodesDao extends AbstractDao {

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				SELECT 
					postal_code, 
					settlement_name, 
					latitude, 
					longitude, 
					COUNT(1) as record_count -- Used for Bubble Size
				FROM 02773_research.geo_hungary_postal_codes
				WHERE latitude IS NOT NULL
				GROUP BY postal_code, settlement_name, latitude, longitude;
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
