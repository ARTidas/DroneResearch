<?php

    /* ********************************************************
     * ********************************************************
     * ********************************************************/
    class StringHelper {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function toURLSafeString($input) {
            // Trim whitespace
            $input = trim($input);

            // Convert to lowercase
            $input = strtolower($input);

            // Replace spaces and underscores with dashes
            $input = preg_replace('/[\s_]+/', '-', $input);

            // Remove non URL-safe characters (keep letters, numbers, and dashes)
            $input = preg_replace('/[^a-z0-9\-]/', '', $input);

            // Remove consecutive dashes
            $input = preg_replace('/-+/', '-', $input);

            // Trim dashes from the beginning and end
            $input = trim($input, '-');

            return $input;
        }

        /* ********************************************************
         * *** camelCase ******************************************
         * ********************************************************/
        public static function toCamelCase($input) {
            // Convert the string to lowercase
            $input = strtolower($input);

            // Split the string into words based on spaces, underscores, or dashes
            $words = preg_split('/[\s_-]+/', $input);

            // Capitalize the first letter of each word, except the first word
            $camel_case = $words[0];
            for ($i = 1; $i < count($words); $i++) {
                $camel_case .= ucfirst($words[$i]);
            }

            return $camel_case;
        }

        /* ********************************************************
         * *** PascalCase *****************************************
         * ********************************************************/
        public static function toPascalCase($input) {
            // Convert the string to lowercase
            $input = strtolower($input);
            
            // Split the string into words based on spaces, underscores, or dashes
            $words = preg_split('/[\s_-]+/', $input);
            
            // Capitalize the first letter of each word
            $pascal_case = '';
            foreach ($words as $word) {
                $pascal_case .= ucfirst($word);
            }
            
            return $pascal_case;
        }

    }

?>