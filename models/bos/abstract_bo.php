<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	abstract class AbstractBo {

        protected $dao;
		protected $do_factory;

        public $actor_name;

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function __construct($actor_name) {
            $this->actor_name = $actor_name;

			$this->dao = (
                (new DaoFactory())->get(
                    $this->actor_name
                )
            );

			$this->do_factory = new DoFactory();
		}

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function validateDo(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForCreation($key)) {
                    if (empty($value)) {
                        LogHelper::addWarning('Please fill out the following attribute: ' . $key);
                    }
                }
            }

			if (isset($do->password) && isset($do->password_again)) {
				if ($do->password !== $do->password_again) {
					LogHelper::addWarning('Password and retyped password does not match!');
				}
			}
		}

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function isDoValid(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForCreation($key)) {
                    if (empty($value)) {
                        
                        return false;
                    }
                }
            }

            return true;
		}

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function validateDoForLogin(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForLogin($key)) {
                    if (empty($value)) {
                        LogHelper::addWarning('Please fill out the following attribute: ' . $key);
                    }
                }
            }
		}

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function isDoValidForLogin(AbstractDo $do) {
			foreach ($do->getAttributes() as $key => $value) {
                if (ActorHelper::isAttributeRequiredForLogin($key)) {
                    if (empty($value)) {
                        
                        return false;
                    }
                }
            }

            return true;
		}

        /* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function create(AbstractDo $do) {
			throw new Exception('Unimplemented function: "cretate" in child of AbstractBo...');
			/*return $this->dao->create([
				$do->type,
				$do->description
			]);*/
		}

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function update(AbstractDo $do) {
			throw new Exception('Unimplemented function: "update" in child of AbstractBo...');
			/*return $this->dao->update([
				$do->type,
				$do->description
			]);*/
		}

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
		public function get(AbstractDo $do) {
			$do_factory = new DoFactory();
			
			$records = $this->dao->get([$do->id]);
			if (isset($records[0])) {
				$record = $records[0];
			}

			if (empty($record)) {
				LogHelper::addWarning('Could not find record for: ' . $this->actor_name);
			}
			else {
				return $do_factory->get($this->actor_name, $record);
			}
			
			return $do;
		}

		/* ********************************************************
		 * ********************************************************
		 * ********************************************************/
		public function delete(AbstractDo $do) {
			LogHelper::addMessage(
				'Deleting record for: ' . $this->actor_name .
				', with id: #' . $do->id
			);
			
			return $this->dao->delete([$do->id]);
		}


    }

?>