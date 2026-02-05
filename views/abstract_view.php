<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	abstract class AbstractView {

        public $do;

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        function __construct(ViewDo $do) {
			$this->do = $do;
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayHTMLOpen() {
			?>
				<!doctype html>
                <html lang="en-US">
                <head>
                    <title><?php print($this->do->title); ?></title>

                    <meta charset="UTF-8" />
                    <meta http-equiv="content-type" content="text/html" />
                    <meta name="description" content="<?php print($this->do->description); ?>" />
                    <meta http-equiv="cache-control" content="max-age=0" />
                    <meta http-equiv="cache-control" content="no-cache" />
                    <meta http-equiv="expires" content="0" />
                    <meta http-equiv="pragma" content="no-cache" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/menu.css" type="text/css" />
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/form.css" type="text/css" />
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/footer.css" type="text/css" />
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/calendar.css" type="text/css" />
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/map.css" type="text/css" />
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/index.css" type="text/css" />

                    <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/jquery/jquery.js"></script>
                    <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/nav_menu_dropdown.js"></script>

                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/leaflet.css" type="text/css" />
                    
                </head>
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayHeader() {
			?>
				<div class="head_container">
                    <h1><?php print(RequestHelper::$project_name); ?></h1>
                    <?php
                        if (isset($_SESSION['user_id'])) {
                            if (isset($_SESSION['user_name'])) {
                                print('<p>Hello ' . $_SESSION['user_name'] . '!</p>');
                            }
                            else {
                                print('<p>Hello user#' . $_SESSION['user_id'] . '</p>');
                            }
                        }
                    ?>
                </div>
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayMenu() {
			?>
                <div class="box">
                    <?php
                        print(RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action);
                    ?>
                </div>

				<section id="menu">
                    <nav>
                        <a href="<?php print(RequestHelper::$url_root); ?>">Main</a>
                        <a href="<?php print(RequestHelper::$url_domain); ?>">PTI Main</a>

                        <div>
                            <button>Task types</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task_type/list">List</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task_type/create">Create</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task_type/modify">Modify</a>
                            </div>
                        </div>

                        <div>
                            <button>Tasks</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task/list">List</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task/create">Create</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/task/modify">Modify</a>
                            </div>
                        </div>

                    </nav>
                </section>

                
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
			?>
				<div class="main_container">
                    <h1>
                        <?php print(RequestHelper::$actor_class_name); ?>
                        <?php print(RequestHelper::$actor_action); ?>
                    </h1>
                </div>
                <hr />
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayFooter() {
			?>
                <div class="footer_container">
                    <p><a href="https://unithe.hu/" target="_blank">University of Tokaj</a></p>
                </div>
            <?php
        }

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayLogs() {
			?>
				<div class="log_container">
                    <!-- <h2>Logs</h2> -->
                    <div class="logs">
                        <h3>Errors</h3>
                        <div class="log_errors">
                            <?php
                                foreach (LogHelper::getErrors() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>

                        <h3>Confirmations</h3>
                        <div class="log_confirmations">
                            <?php
                                foreach (LogHelper::getConfirmations() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>

                        <h3>Warnings</h3>
                        <div class="log_warnings">
                            <?php
                                foreach (LogHelper::getWarnings() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>

                        <h3>Messages</h3>
                        <div class="log_messages">
                            <?php
                                foreach (LogHelper::getMessages() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>
                    </div>
                </div>
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayHTMLClose() {
			?>
                </body>
                </html>
            <?php
        }

    }

?>