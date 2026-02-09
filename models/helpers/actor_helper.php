<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class ActorHelper {

		const USER	= 'User';

		/* ********************************************************
         * ********************************************************
         * ********************************************************/
        public static function isAttributeRequiredForDroneSocietyCreate($input) {
            if (
				$input === 'profession' ||
				$input === 'gender' ||
				$input === 'biggest_fear_hope' ||
				$input === 'class_actor' ||
				$input === 'id' ||
				$input === 'is_active' ||
				$input === 'created_at' ||
				$input === 'updated_at' ||
				$input === 'submitted_at'
			) {
				return false;
			}

			return true;
        }

		


    }