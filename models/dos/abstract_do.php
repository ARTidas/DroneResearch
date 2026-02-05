<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	abstract class AbstractDo {

        public $class_actor = null;
        public $id;
        public $is_active;
        public $created_at;
        public $updated_at;
        
        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        function __construct($attributes = null, $class_actor = null) {
            $this->class_actor = $class_actor;
            
            if ($attributes != null) {
                foreach ($attributes as $key => $value) {
                    $this->$key = $value;
                }
            }
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function getAttributes() {
            return get_object_vars($this);
        }

    }
?>