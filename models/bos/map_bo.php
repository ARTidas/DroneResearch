<?php

    /* ********************************************************
	 * ********************************************************
	 * ********************************************************/
    class MapBo extends AbstractBo {

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


    }

?>