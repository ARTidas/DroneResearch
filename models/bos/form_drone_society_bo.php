<?php

    /* ********************************************************
	 * ********************************************************
	 * ********************************************************/
    class FormDroneSocietyBo extends AbstractBo {

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function getList() {
			$do_list = [];
			
			$records = $this->dao->getList();

			if (empty($records)) {
				LogHelper::addWarning('There are no records of: ' . $this->actor_name);
			}
			else {
				foreach ($records as $record) {
					$do_list[] = $this->do_factory->get($this->actor_name, $record);
				}
			}
			
			return $do_list;
		}

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function create(AbstractDo $do) {
            $this->validateDoForCreate($do);

            if (!$this->isDoValidForCreate($do)) {
                return false;
            }

            $last_insert_id = $this->dao->create([
                	$do->age,
					$do->country,
					$do->postal_code,
					$do->profession,
					$do->gender,
					$do->education,
					$do->drone_familiarity,
					$do->biggest_fear_hope,
					$do->S1,
					$do->S2,
					$do->S3,
					$do->S4,
					$do->W1,
					$do->W2,
					$do->W3,
					$do->W4,
					$do->O1,
					$do->O2,
					$do->O3,
					$do->O4,
					$do->T1,
					$do->T2,
					$do->T3,
					$do->T4
            ]);

            if ($last_insert_id) {
                LogHelper::addConfirmation('Created record with id: #' . $last_insert_id);
            }
            else {
                LogHelper::addWarning('Failed to create record!');
            }

			return $last_insert_id;
		}


		

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function validateDoForCreate(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForDroneSocietyCreate($key)) {
                    if (empty($value)) {
                        LogHelper::addWarning('Please fill out the following attribute: ' . $key);
                    }
                }
            }
		}

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function isDoValidForCreate(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForDroneSocietyCreate($key)) {
                    if (empty($value)) {
                        
                        return false;
                    }
                }
            }

            return true;
		}




    }

?>