<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class FormDroneSocietyDao extends AbstractDao {

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


		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function create(array $parameters) {
			$query_string = "/* __CLASS__ __FUNCTION__ __FILE__ __LINE__ */
				INSERT INTO
					02773_research.form_responses_drone_society_v2
				SET
                    submitted_at        = NOW(),
					age 				= ?,
					country 			= ?, 
					postal_code 		= ?, 
					profession 			= ?, 
					gender 				= ?, 
					education 			= ?, 
					drone_familiarity 	= ?, 
					biggest_fear_hope	= ?,
					S1 = ?, S2 = ?, S3 = ?, S4 = ?, 
					W1 = ?, W2 = ?, W3 = ?, W4 = ?, 
					O1 = ?, O2 = ?, O3 = ?, O4 = ?, 
					T1 = ?, T2 = ?, T3 = ?, T4 = ?
			";

			try {
				$database_connection = ($this->database_connection_bo)->getConnection();

				$database_connection
					->prepare($query_string)
					->execute(
						(
							array_map(
								function($value) {
									return $value === '' ? NULL : $value;
								},
								$parameters
							)
						)
					)
				;

				return(
					$database_connection->lastInsertId()
				);
			}
			catch(Exception $exception) {
				LogHelper::addError('ERROR: ' . $exception->getMessage());

				return false;
			}
		}

		
	}
?>
