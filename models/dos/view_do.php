<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class ViewDo {

        public $title;
        public $description;
        public $do_list;
        public $do;
        public $search_string;
        public $json_data;

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        function __construct(
            $title          = null,
            $description    = null,
            $do_list        = null,
            $do             = null,
            $search_string  = null,
            $json_data      = null
        ) {
			$this->title            = $title;
            $this->description      = $description;
            $this->do_list          = $do_list;
            $this->do               = $do;
            $this->search_string    = $search_string;
            $this->json_data        = $json_data;
		}

    }

?>