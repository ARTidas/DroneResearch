<?php

	/* ********************************************************
	 * ********************************************************
	 * ********************************************************/
	class WordCloudListView extends ProjectAbstractView {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
			?>
                <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/D3/d3.js"></script>
                <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/D3/d3_layout_cloud.js"></script>
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
                    Open-Ended response word cloud
                </h1>


                <h2>Biggest fear / hope regarding drones (ENG)</h2>
                <div id="chart-wordcloud" class="chart-container"></div>

                <h2>Biggest fear / hope regarding drones (HUN)</h2>
                <div id="chart-wordcloud-hun" class="chart-container"></div>

                <!-- <h2>Biggest fear / hope regarding drones (ENG)</h2>
                <div id="chart-wordcloud-stationary" class="chart-container"></div>

                <h2>Biggest fear / hope regarding drones (HUN)</h2>
                <div id="chart-wordcloud-hun-stationary" class="chart-container"></div> -->
                

                <script>
                    // This injects the database rows directly into a JS variable
                    const dbData = <?php print($this->do->json_data); ?>;
                    console.log("Data loaded:", dbData.length, "rows");
                </script>
                
                <script src="js/word_cloud_list.js"></script>

			<?php
		}

    }

?>