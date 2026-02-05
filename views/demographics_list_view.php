<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class DemographicsListView extends ProjectAbstractView {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
			?>
                <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/D3/d3.js"></script>
                <style>
                    .chart-container { display: inline-block; margin: 10px; text-align: center; }
                    .tooltip { 
                        position: absolute; 
                        text-align: center; 
                        padding: 6px; 
                        font-size: 12px; 
                        background: #333; 
                        color: #fff; 
                        border-radius: 4px; 
                        pointer-events: none;
                        opacity: 0;
                    }
                </style>
                
                
				<!-- <h1>
                    <?php print(RequestHelper::$actor_class_name); ?>
                    <?php print(RequestHelper::$actor_action); ?>
                </h1> -->
                <h1>
                    Questionnaire participants demographic characteristics
                </h1>


                <h2>Gender</h2>
                <div id="chart-gender" class="chart-container"><h3>Gender</h3></div>

                <h2>Education</h2>
                <div id="chart-education" class="chart-container"><h3>Education</h3></div>

                <h2>Population pyramid</h2>
                <div id="chart-pyramid" class="chart-container"><h3>Population Pyramid</h3></div>
                

                <script>
                    // This injects the database rows directly into a JS variable
                    const dbData = <?php print($this->do->json_data); ?>;
                    console.log("Data loaded:", dbData.length, "rows");
                </script>
                
                <script src="js/demographics_list.js"></script>

			<?php
		}

    }

?>