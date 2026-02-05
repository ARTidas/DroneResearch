<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class DatetimeHelper {

		/* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function groupUserDOsByMonth($do_list) {
            $birthdays_by_month = [];
        
            foreach ($do_list as $do) {
                if (!empty($do->birthday_at)) {
                    $birthdays_by_month[date("F", strtotime($do->birthday_at))][] = $do;
                }
            }
        
            return $birthdays_by_month;
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function formatToBirthday($input_string) {
            // Convert input string into a DateTime object
            $date = new DateTime($input_string);
            
            // Subtract one day
            $date->modify('-1 day');

            // Format the new date to "F j" (e.g., "July 17")
            return $date->format('F j');
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function hoursDifference($date1, $date2) {
            // Convert the date strings to DateTime objects
            $datetime1 = new DateTime($date1);
            $datetime2 = new DateTime($date2);
        
            // Calculate the difference between the two dates
            $interval = $datetime1->diff($datetime2);
        
            // Get the total number of hours (days * 24 + hours)
            $hours = $interval->days * 24 + $interval->h + ($interval->i / 60);
        
            // Return the result with a precision of one decimal point
            return round($hours, 1);
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function getYearAndMonth($date) {
            // Convert the date string to a DateTime object
            $datetime = new DateTime($date);
            
            // Get the year and month
            $year       = $datetime->format('Y');
            $month      = $datetime->format('m');
            $month_name = $datetime->format('F'); // 'F' gives the full month name
            
            // Return the year and month as an array
            //return ['year' => $year, 'month' => $month];
            return $year . '-' . $month_name;
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function getCurrentMonth() {
            return date('Y-F');
        }
        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function getPreviousMonth() {
            return date('Y-F', strtotime('first day of last month'));
        }

    }