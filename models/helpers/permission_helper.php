<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class PermissionHelper {

        public static $user_permission_do_list;

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function isUserAuthorized($permission_name) {

            if (empty(self::$user_permission_do_list)) {
                return false;
            }

            foreach (self::$user_permission_do_list as $user_permission_do) {
                if ($permission_name === $user_permission_do->name) {
                    
                    return true;
                }
            }

            return false;
        }

    }