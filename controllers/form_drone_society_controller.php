<?php

	$bo = $bo_factory->get(StringHelper::toPascalCase(RequestHelper::$actor_name));
    $do = new FormDroneSocietyDo;
	
	/*$do->age = 38;
	$do->country = 'Hungary';
	$do->postal_code = '3980';
	$do->profession = 'Hallgató';
	$do->gender = 'Male';
	$do->education = 'Higher education';
	$do->drone_familiarity = '3';
	$do->biggest_fear_hope = 'XXXasdXXX';
	$do->S1 = '2';
	$do->S2 = '3';
	$do->S3 = '4';
	$do->S4 = '5';
	$do->W1 = '5';
	$do->W2 = '4';
	$do->W3 = '3';
	$do->W4 = '2';
	$do->O1 = '1';
	$do->O2 = '1';
	$do->O3 = '2';
	$do->O4 = '3';
	$do->T1 = '4';
	$do->T2 = '5';
	$do->T3 = '5';
	$do->T4 = '1';*/
	
	if ($do->country === null) {
		$do->country = 'Hungary';
	}

	if (isset($_POST['create']) && $_POST['create'] === 'Válaszok beküldése') {	
		//submitted_at = NOW()

		$do->age   						= $_POST['age'];
		$do->country   					= $_POST['country'];
		$do->postal_code 				= $_POST['postal_code'];
		$do->profession 				= $_POST['profession'];
		$do->gender 					= $_POST['gender'];
        $do->education 					= $_POST['education'];
		$do->drone_familiarity 			= $_POST['drone_familiarity'];
        $do->biggest_fear_hope 			= $_POST['biggest_fear_hope'];
		
		$do->S1   						= $_POST['S1'];
		$do->S2   						= $_POST['S2'];
		$do->S3   						= $_POST['S3'];
		$do->S4   						= $_POST['S4'];

		$do->W1   						= $_POST['W1'];
		$do->W2   						= $_POST['W2'];
		$do->W3   						= $_POST['W3'];
		$do->W4   						= $_POST['W4'];

		$do->O1   						= $_POST['O1'];
		$do->O2   						= $_POST['O2'];
		$do->O3   						= $_POST['O3'];
		$do->O4   						= $_POST['O4'];

		$do->T1   						= $_POST['T1'];
		$do->T2   						= $_POST['T2'];
		$do->T3   						= $_POST['T3'];
		$do->T4   						= $_POST['T4'];

        $do->id = $bo->create($do);
    }
    
	/* ********************************************************
	 * *** Lets control exectution by actor action... *********
	 * ********************************************************/
	$view = null;

	switch (RequestHelper::$actor_action) {
		case '':
			LogHelper::addError('No actor action detected...');
			break;
		case 'hun':
			$view = new FormDroneSocietyHunListView(
				new ViewDo(
					RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action,
					'DESCRIPTION - ' . RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action,
					null, //do_list
                    $do, //do
                    null, //search_string
                    null //json_encode($do_list) //data_array,
				),
			);
			
			break;
		default:
			LogHelper::addError('Unhandled action...');
			break;
	}

	$view->displayHTMLOpen();
	$view->displayHeader();
	$view->displayMenu();
	$view->displayContent();
	$view->displayFooter();
	$view->displayLogs();
	$view->displayHTMLClose();

?>
