<?php

	$bo = $bo_factory->get(StringHelper::toPascalCase(RequestHelper::$actor_name));
    $do_list = $bo->getList();
    
	/* ********************************************************
	 * *** Lets control exectution by actor action... *********
	 * ********************************************************/
	$view = null;

	switch (RequestHelper::$actor_action) {
		case '':
			LogHelper::addError('No actor action detected...');
			break;
		case 'list':
			$view = new MapAllPostalCodesListView(
				new ViewDo(
					RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action,
					'DESCRIPTION - ' . RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action,
					$do_list, //do_list
                    null, //do
                    null, //search_string
                    json_encode($do_list) //data_array,
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
