<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class SwotListView extends ProjectAbstractView {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
			?>
                <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/D3/d3.js"></script>
                <style>
                    .chart-container { display: inline-block; margin: 10px; text-align: left; }
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
                    SWOT
                </h1>


                <div class="chart-container">
                    <h3>Total Strategic Position</h3>
                    <div id="chart-swot"></div>
                </div>

                <div class="chart-container">
                    <h3>Component Breakdown (S-W-O-T)</h3>
                    <div id="chart-swot-breakdown"></div>
                </div>
                

                <script>
                    // This injects the database rows directly into a JS variable
                    const dbData = <?php print($this->do->json_data); ?>;
                    console.log("Data loaded:", dbData.length, "rows");
                </script>
                
                <script src="js/swot_list.js"></script>

			<?php
		}

    }

?>