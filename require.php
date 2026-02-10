<?php

    /* ********************************************************
	 * *** Models *********************************************
	 * ********************************************************/

        /* ********************************************************
         * *** Business Objects ***********************************
         * ********************************************************/
        require(RequestHelper::$file_root . '/models/bos/abstract_bo.php');
        require(RequestHelper::$file_root . '/models/bos/mariadb_database_connection_bo.php');
        require(RequestHelper::$file_root . '/models/bos/form_drone_society_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_report_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_v2_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_all_settlements_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_all_postal_codes_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_urban_vs_rural_bo.php');
        require(RequestHelper::$file_root . '/models/bos/map_zs_bo.php');
        require(RequestHelper::$file_root . '/models/bos/demographics_bo.php');
        require(RequestHelper::$file_root . '/models/bos/swot_bo.php');
        require(RequestHelper::$file_root . '/models/bos/swot_splits_bo.php');
        require(RequestHelper::$file_root . '/models/bos/word_cloud_bo.php');

        /* ********************************************************
         * *** Data Access Objects ********************************
         * ********************************************************/
        require(RequestHelper::$file_root . '/models/daos/abstract_dao.php');
        require(RequestHelper::$file_root . '/models/daos/form_drone_society_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_report_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_v2_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_all_settlements_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_all_postal_codes_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_urban_vs_rural_dao.php');
        require(RequestHelper::$file_root . '/models/daos/map_zs_dao.php');
        require(RequestHelper::$file_root . '/models/daos/demographics_dao.php');
        require(RequestHelper::$file_root . '/models/daos/swot_dao.php');
        require(RequestHelper::$file_root . '/models/daos/swot_splits_dao.php');
        require(RequestHelper::$file_root . '/models/daos/word_cloud_dao.php');

        /* ********************************************************
         * *** Data Objects ***************************************
         * ********************************************************/
        require(RequestHelper::$file_root . '/models/dos/view_do.php');
        require(RequestHelper::$file_root . '/models/dos/abstract_do.php');
        require(RequestHelper::$file_root . '/models/dos/form_drone_society_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_report_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_v2_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_all_settlements_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_all_postal_codes_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_urban_vs_rural_do.php');
        require(RequestHelper::$file_root . '/models/dos/map_zs_do.php');
        require(RequestHelper::$file_root . '/models/dos/demographics_do.php');
        require(RequestHelper::$file_root . '/models/dos/swot_do.php');
        require(RequestHelper::$file_root . '/models/dos/swot_splits_do.php');
        require(RequestHelper::$file_root . '/models/dos/word_cloud_do.php');

        /* ********************************************************
         * *** Helpers ********************************************
         * ********************************************************/
        require(RequestHelper::$file_root . '/models/helpers/log_helper.php');
        require(RequestHelper::$file_root . '/models/helpers/actor_helper.php'); //TODO: Do we need this?
        require(RequestHelper::$file_root . '/models/helpers/string_helper.php');
        require(RequestHelper::$file_root . '/models/helpers/datetime_helper.php');
        require(RequestHelper::$file_root . '/models/helpers/permission_helper.php');

        /* ********************************************************
         * *** Factories ******************************************
         * ********************************************************/
        require(RequestHelper::$file_root . '/models/factories/bo_factory.php');
        require(RequestHelper::$file_root . '/models/factories/dao_factory.php');
        require(RequestHelper::$file_root . '/models/factories/do_factory.php');


    /* ********************************************************
	 * *** Views **********************************************
	 * ********************************************************/
    require(RequestHelper::$file_root . '/views/abstract_view.php');
    require(RequestHelper::$file_root . '/views/project_abstract_view.php');
    require(RequestHelper::$file_root . '/views/index_view.php');
    require(RequestHelper::$file_root . '/views/form_drone_society_hun_list_view.php');
    require(RequestHelper::$file_root . '/views/map_report_drone_familiarity_view.php');
    require(RequestHelper::$file_root . '/views/map_report_swot_view.php');
    require(RequestHelper::$file_root . '/views/map_report_so_attribute_view.php');
    require(RequestHelper::$file_root . '/views/map_report_wt_attribute_view.php');
    require(RequestHelper::$file_root . '/views/map_list_view.php');
    require(RequestHelper::$file_root . '/views/map_v2_list_view.php');
    require(RequestHelper::$file_root . '/views/map_all_settlements_list_view.php');
    require(RequestHelper::$file_root . '/views/map_all_postal_codes_list_view.php');
    require(RequestHelper::$file_root . '/views/map_urban_vs_rural_list_view.php');
    require(RequestHelper::$file_root . '/views/map_zs_list_view.php');
    require(RequestHelper::$file_root . '/views/demographics_list_view.php');
    require(RequestHelper::$file_root . '/views/swot_list_view.php');
    require(RequestHelper::$file_root . '/views/swot_splits_list_view.php');
    require(RequestHelper::$file_root . '/views/word_cloud_list_view.php');

?>