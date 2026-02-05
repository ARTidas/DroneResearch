<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class MapDao extends AbstractDao {

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				SELECT
					responder_postal_code,
					COUNT(1) AS responders,
					geo_responder_settlement_latitude,
					geo_responder_settlement_longitude
				FROM
					02773_research.drone_society
				GROUP BY
					responder_postal_code,
					geo_responder_settlement_latitude,
					geo_responder_settlement_longitude
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
