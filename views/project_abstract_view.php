<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	abstract class ProjectAbstractView extends AbstractView {

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
                    <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/index.css" type="text/css" />

                    <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/jquery/jquery.js"></script>
                    <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/nav_menu_dropdown.js"></script>
                </head>
			<?php
		}

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayMenu() {
			?>
                <!-- <div class="box">
                    <?php
                        print(RequestHelper::$project_name . ' > ' . RequestHelper::$actor_name . ' > ' . RequestHelper::$actor_action);
                    ?>
                </div> -->

				<section id="menu">
                    <nav>
                        <a href="<?php print(RequestHelper::$url_root); ?>">Main</a>

                        <div>
                            <button>Forms</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/form_drone_society/hun">(HUN) Drónok társadalmi megítélése</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/form_drone_society/eng">(ENG) Dronses social perception</a>
                            </div>
                        </div>

                        <div>
                            <button>Map reports</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map_report/drone_familiarity">Drone familiarity</a>
                            </div>
                        </div>

                        <div>
                            <button>Maps</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map">Questionnaire pins</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map_v2">Questionnaire heatmap</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map_urban_vs_rural">Urban vs. Rural</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map_all_settlements">Settlements</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/map_all_postal_codes">Postal codes</a>
                            </div>
                        </div>
                        
                        <!-- <a href="<?php print(RequestHelper::$url_root); ?>/map_zs">Map ZS</a>  -->
                        <a href="<?php print(RequestHelper::$url_root); ?>/word_cloud">Word cloud</a>
                        <a href="<?php print(RequestHelper::$url_root); ?>/demographics">Demographics</a>
                        <a href="<?php print(RequestHelper::$url_root); ?>/swot">SWOT</a>
                        <a href="<?php print(RequestHelper::$url_root); ?>/swot_splits">SWOT splits</a>

                        <div>
                            <button>JASP analysis</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/cdn/analysis/DronMegiteles_202511131820.html">Analysis - 2025-11-31 18:20</a>
                            </div>
                        </div>

                        <!-- <div>
                            <button>User</button>
                            <div>
                                <a href="<?php print(RequestHelper::$url_root); ?>/user/create">Register</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/user/login">Login</a>
                                <a href="<?php print(RequestHelper::$url_root); ?>/user_profile/view">Profile</a>
                            </div>
                        </div> -->

                    </nav>
                </section>

                
			<?php
		}

    }

?>