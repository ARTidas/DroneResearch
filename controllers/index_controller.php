<?php

    $view = new IndexView(
        new ViewDo(
            RequestHelper::$project_name . ' > ' . 'Main',
            'DESCRIPTION - ' . RequestHelper::$project_name . ' > ' . 'Main',
            null,
        ),
    );

    $view->displayHTMLOpen();
    $view->displayHeader();
    $view->displayMenu();
    $view->displayContent();
    $view->displayFooter();
    $view->displayLogs();
    $view->displayHTMLClose();

?>