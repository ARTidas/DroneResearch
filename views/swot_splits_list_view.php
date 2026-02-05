<?php

    /* ********************************************************
     * ********************************************************
     * ********************************************************/
    class SwotSplitsListView extends ProjectAbstractView {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
            ?>
                <script type="text/javascript" src="<?php print(RequestHelper::$url_root); ?>/js/D3/d3.js"></script>
                <style>
                    .chart-wrapper {
                        display: inline-block;
                        vertical-align: top;
                        margin-bottom: 40px;
                        text-align: left;
                        border: 1px solid #eee;
                        padding: 10px;
                        border-radius: 8px;
                        background: #fff;
                    }
                    .chart-row {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: left;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    h2 { border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-top: 40px; }
                </style>
                
                <h1>SWOT Analysis & Demographics</h1>

                <h2>Total Strategic Position</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Net Position (Total)</h3>
                        <div id="chart-total-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Breakdown (Total)</h3>
                        <div id="chart-total-breakdown"></div>
                    </div>
                </div>

                <h2>Gender Split (Male vs Female)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison</h3>
                        <div id="chart-gender-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison</h3>
                        <div id="chart-gender-breakdown"></div>
                    </div>
                </div>


                <h2>Age Split (Younger vs Older)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison</h3>
                        <div id="chart-age-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison</h3>
                        <div id="chart-age-breakdown"></div>
                    </div>
                </div>

                <h2>Age Buckets (Decades)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (By Decade)</h3>
                        <div id="chart-age-bucket-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (By Decade)</h3>
                        <div id="chart-age-bucket-breakdown"></div>
                    </div>
                </div>


                <h2>Education Split</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Education)</h3>
                        <div id="chart-education-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Education)</h3>
                        <div id="chart-education-breakdown"></div>
                    </div>
                </div>



                <h2>Settlement Split (Rural vs. Urban)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Settlement)</h3>
                        <div id="chart-settlement-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Settlement)</h3>
                        <div id="chart-settlement-breakdown"></div>
                    </div>
                </div>




                <h2>Drone Familiarity (More vs. Less)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Familiarity)</h3>
                        <div id="chart-familiarity-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Familiarity)</h3>
                        <div id="chart-familiarity-breakdown"></div>
                    </div>
                </div>





                <h2>Profession Group (Cleaned)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Profession)</h3>
                        <div id="chart-profession-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Profession)</h3>
                        <div id="chart-profession-breakdown"></div>
                    </div>
                </div>



                <h2>Psychographic Clusters (Optimist vs Skeptic)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Clusters)</h3>
                        <div id="chart-cluster-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Clusters)</h3>
                        <div id="chart-cluster-breakdown"></div>
                    </div>
                </div>

                <h2>Generation x Gender (Interaction)</h2>
                <div class="chart-row">
                    <div class="chart-wrapper">
                        <h3>Strategic Comparison (Gen x Gender)</h3>
                        <div id="chart-gengender-matrix"></div>
                    </div>
                    <div class="chart-wrapper">
                        <h3>Component Comparison (Gen x Gender)</h3>
                        <div id="chart-gengender-breakdown"></div>
                    </div>
                </div>


                

                <script>
                    // Inject database rows
                    const dbData = <?php print($this->do->json_data); ?>;
                    console.log("Data loaded:", dbData.length, "rows");
                </script>
                
                <script src="js/swot_splits_list.js"></script>

            <?php
        }

    }
?>