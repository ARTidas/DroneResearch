<?php

    /* ********************************************************
     * ********************************************************
     * ********************************************************/
    class FormDroneSocietyHunListView extends ProjectAbstractView {

        /* ********************************************************
         * ********************************************************
         * ********************************************************/
        public function displayContent() {
            ?>
                <link rel="stylesheet" href="<?php print(RequestHelper::$url_root); ?>/css/survey_form.css" type="text/css" />
                
            <?php if ($this->do->do->id) { ?>
                <div class="container">
                    <p class="description">
                        Köszönjük a kitöltést!
                    </p>
                </div>
            <?php } else { ?>

                <div class="container">
                    <h1>Drónok a mindennapokban</h1>
                    <p class="description">
                        Kérdőív a társadalmi megítélésről.<br>
                        A kutatás célja, hogy feltérképezzük, hogyan viszonyul a társadalom a drónok egyre gyakoribb megjelenéséhez.<br>
                        Az adatok feldolgozása anonim módon történik.<br>
                        <span class="required">* Kötelező mező</span>
                    </p>

                    <form action="" method="POST">

                        <div class="log_warnings">
                            <?php
                                foreach (LogHelper::getWarnings() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>
                        <div class="log_confirmations">
                            <?php
                                foreach (LogHelper::getConfirmations() as $log) {
                                    print('<p>' . $log . '</p><hr />');
                                }
                            ?>
                        </div>

                        <h3 class="section-title">Demográfiai adatok</h3>

                        <div class="form-group">
                            <label>Életkora <span class="required">*</span></label>
                            <input 
                                type="number" 
                                name="age" 
                                min="10" 
                                max="100" 
                                placeholder="Például: 35" 
                                required
                                value="<?php echo $this->do->do->age; ?>"
                            >
                        </div>

                        <script>
                            function toggleZipPattern() {
                                var country = document.getElementById("countrySelector").value;
                                var zipInput = document.getElementById("zipInput");

                                if (country === "Hungary") {
                                    // Enforce 4 digits for Hungary
                                    zipInput.setAttribute("pattern", "[0-9]{4}");
                                    zipInput.setAttribute("title", "Magyarországi cím esetén 4 jegyű irányítószámot adjon meg.");
                                    zipInput.placeholder = "Például: 1054";
                                } else {
                                    // Remove restriction for other countries
                                    zipInput.removeAttribute("pattern");
                                    zipInput.setAttribute("title", "Kérjük, adja meg az irányítószámát.");
                                    zipInput.placeholder = "Irányítószám";
                                }
                            }
                        </script>

                        <div class="form-group">
                            <label>Lakhelyének Országa <span class="required">*</span></label>
                            <select name="country" id="countrySelector" required onchange="toggleZipPattern()">
                                <option value="" disabled selected>Válasszon országot...</option>
                                <option value="Albania" <?php if ($this->do->do->country === 'Albania') {print("selected");} ?>>Albánia</option>
                                <option value="Andorra" <?php if ($this->do->do->country === 'Andorra') {print("selected");} ?>>Andorra</option>
                                <option value="Austria" <?php if ($this->do->do->country === 'Austria') {print("selected");} ?>>Ausztria</option>
                                <option value="Azerbaijan" <?php if ($this->do->do->country === 'Azerbaijan') {print("selected");} ?>>Azerbajdzsán</option>
                                <option value="Belgium" <?php if ($this->do->do->country === 'Belgium') {print("selected");} ?>>Belgium</option>
                                <option value="Bosnia and Herzegovina" <?php if ($this->do->do->country === 'Bosnia and Herzegovina') {print("selected");} ?>>Bosznia-Hercegovina</option>
                                <option value="Bulgaria" <?php if ($this->do->do->country === 'Bulgaria') {print("selected");} ?>>Bulgária</option>
                                <option value="Cyprus" <?php if ($this->do->do->country === 'Cyprus') {print("selected");} ?>>Ciprus</option>
                                <option value="Denmark" <?php if ($this->do->do->country === 'Denmark') {print("selected");} ?>>Dánia</option>
                                <option value="United Kingdom" <?php if ($this->do->do->country === 'United Kingdom') {print("selected");} ?>>Egyesült Királyság</option>
                                <option value="Finland" <?php if ($this->do->do->country === 'Finland') {print("selected");} ?>>Finnország</option>
                                <option value="France" <?php if ($this->do->do->country === 'France') {print("selected");} ?>>Franciaország</option>
                                <option value="Georgia" <?php if ($this->do->do->country === 'Georgia') {print("selected");} ?>>Grúzia</option>
                                <option value="Greece" <?php if ($this->do->do->country === 'Greece') {print("selected");} ?>>Görögország</option>
                                <option value="Netherlands" <?php if ($this->do->do->country === 'Netherlands') {print("selected");} ?>>Hollandia</option>
                                <option value="Croatia" <?php if ($this->do->do->country === 'Croatia') {print("selected");} ?>>Horvátország</option>
                                <option value="Iceland" <?php if ($this->do->do->country === 'Iceland') {print("selected");} ?>>Izland</option>
                                <option value="Latvia" <?php if ($this->do->do->country === 'Latvia') {print("selected");} ?>>Lettország</option>
                                <option value="Liechtenstein" <?php if ($this->do->do->country === 'Liechtenstein') {print("selected");} ?>>Liechtenstein</option>
                                <option value="Lithuania" <?php if ($this->do->do->country === 'Lithuania') {print("selected");} ?>>Litvánia</option>
                                <option value="Luxembourg" <?php if ($this->do->do->country === 'Luxembourg') {print("selected");} ?>>Luxemburg</option>
                                <option value="Hungary" <?php if ($this->do->do->country === 'Hungary') {print("selected");} ?>>Magyarország</option>
                                <option value="Republic of Moldova" <?php if ($this->do->do->country === 'Republic of Moldova') {print("selected");} ?>>Moldova</option>
                                <option value="Monaco" <?php if ($this->do->do->country === 'Monaco') {print("selected");} ?>>Monaco</option>
                                <option value="Montenegro" <?php if ($this->do->do->country === 'Montenegro') {print("selected");} ?>>Montenegró</option>
                                <option value="Malta" <?php if ($this->do->do->country === 'Malta') {print("selected");} ?>>Málta</option>
                                <option value="Norway" <?php if ($this->do->do->country === 'Norway') {print("selected");} ?>>Norvégia</option>
                                <option value="Germany" <?php if ($this->do->do->country === 'Germany') {print("selected");} ?>>Németország</option>
                                <option value="Italy" <?php if ($this->do->do->country === 'Italy') {print("selected");} ?>>Olaszország</option>
                                <option value="Portugal" <?php if ($this->do->do->country === 'Portugal') {print("selected");} ?>>Portugália</option>
                                <option value="Romania" <?php if ($this->do->do->country === 'Romania') {print("selected");} ?>>Románia</option>
                                <option value="San Marino" <?php if ($this->do->do->country === 'San Marino') {print("selected");} ?>>San Marino</option>
                                <option value="Spain" <?php if ($this->do->do->country === 'Spain') {print("selected");} ?>>Spanyolország</option>
                                <option value="Switzerland" <?php if ($this->do->do->country === 'Switzerland') {print("selected");} ?>>Svájc</option>
                                <option value="Sweden" <?php if ($this->do->do->country === 'Sweden') {print("selected");} ?>>Svédország</option>
                                <option value="Serbia" <?php if ($this->do->do->country === 'Serbia') {print("selected");} ?>>Szerbia</option>
                                <option value="Slovak Republic" <?php if ($this->do->do->country === 'Slovak Republic') {print("selected");} ?>>Szlovákia</option>
                                <option value="Slovenia" <?php if ($this->do->do->country === 'Slovenia') {print("selected");} ?>>Szlovénia</option>
                                <option value="Türkiye" <?php if ($this->do->do->country === 'Türkiye') {print("selected");} ?>>Törökország</option>
                                <option value="Ukraine" <?php if ($this->do->do->country === 'Ukraine') {print("selected");} ?>>Ukrajna</option>
                                <option value="Ireland" <?php if ($this->do->do->country === 'Ireland') {print("selected");} ?>>Írország</option>
                                <option value="Armenia" <?php if ($this->do->do->country === 'Armenia') {print("selected");} ?>>Örményország</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Lakhelyének irányítószáma <span class="required">*</span></label>
                            <input 
                                type="text" 
                                name="postal_code" 
                                id="zipInput" 
                                pattern="[0-9]{4}" 
                                placeholder="Például: 1054" 
                                required title="Kérjük, adjon meg egy 4 jegyű irányítószámot."
                                value="<?php echo $this->do->do->postal_code; ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label>Foglalkozása</label>
                            <input 
                                type="text" 
                                name="profession" 
                                placeholder="Például: Hallgató, Asszisztens, Nyugdíjas..."
                                value="<?php echo $this->do->do->profession; ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label>Neme</label>
                            <select name="gender">
                                <option value="" disabled selected>Válasszon...</option>
                                <option value="Male" <?php if ($this->do->do->gender === 'Male') {print("selected");} ?>>Férfi</option>
                                <option value="Female" <?php if ($this->do->do->gender === 'Female') {print("selected");} ?>>Nő</option>
                                <option value="Other" <?php if ($this->do->do->gender === 'Other') {print("selected");} ?>>Egyéb</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Legmagasabb iskolai végzettsége <span class="required">*</span></label>
                            <select name="education" required>
                                <option value="" disabled selected>Válasszon...</option>
                                <option value="Primary school" <?php if ($this->do->do->education === 'Primary school') {print("selected");} ?>>Általános iskola</option>
                                <option value="Vocational school" <?php if ($this->do->do->education === 'Vocational school') {print("selected");} ?>>Szakiskola / Szakmunkásképző</option>
                                <option value="Secondary school" <?php if ($this->do->do->education === 'Secondary school') {print("selected");} ?>>Érettségi (középiskola)</option>
                                <option value="Higher education" <?php if ($this->do->do->education === 'Higher education') {print("selected");} ?>>Felsőfokú végzettség</option>
                                <option value="Academic degree" <?php if ($this->do->do->education === 'Academic degree') {print("selected");} ?>>Tudományos fokozat (PhD, DLA)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Mennyire ismeri vagy használja a drónokat? <span class="required">*</span></label>
                            <select name="drone_familiarity" required>
                                <option value="" disabled selected>Válasszon...</option>
                                <option value="1" <?php if ($this->do->do->drone_familiarity === '1') {print("selected");} ?>>Soha nem találkoztam / nem foglalkoztam velük</option>
                                <option value="2" <?php if ($this->do->do->drone_familiarity === '2') {print("selected");} ?>>Láttam már, vagy hallottam róluk a médiában / környezetemben</option>
                                <option value="3" <?php if ($this->do->do->drone_familiarity === '3') {print("selected");} ?>>Kezeltem már drónt rövidebb ideig</option>
                                <option value="4" <?php if ($this->do->do->drone_familiarity === '4') {print("selected");} ?>>Rendszeresen használok drónt (hobby/munka)</option>
                            </select>
                        </div>

                        <h3 class="section-title">Attitűd kérdések</h3>
                        <p>
                            Kérjük, értékelje 1-től 5-ig. <br/>
                            1 = Egyáltalán nem értek egyet, <br/>
                            5 = Teljes mértékben egyetértek
                        </p>

                        <div class="form-group">
                            <label>A drónok mindennapi jelenléte jelentősen növeli a közbiztonságot <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="S1" id="S1_1" value="1" required <?php if ($this->do->do->S1 === '1') {print("checked");} ?>><label for="S1_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="S1" id="S1_2" value="2" <?php if ($this->do->do->S1 === '2') {print("checked");} ?>><label for="S1_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="S1" id="S1_3" value="3" <?php if ($this->do->do->S1 === '3') {print("checked");} ?>><label for="S1_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="S1" id="S1_4" value="4" <?php if ($this->do->do->S1 === '4') {print("checked");} ?>><label for="S1_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="S1" id="S1_5" value="5" <?php if ($this->do->do->S1 === '5') {print("checked");} ?>><label for="S1_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok gyorsabb és hatékonyabb szolgáltatásokat tesznek lehetővé <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="S2" id="S2_1" value="1" required <?php if ($this->do->do->S2 === '1') {print("checked");} ?>><label for="S2_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="S2" id="S2_2" value="2" <?php if ($this->do->do->S2 === '2') {print("checked");} ?>><label for="S2_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="S2" id="S2_3" value="3" <?php if ($this->do->do->S2 === '3') {print("checked");} ?>><label for="S2_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="S2" id="S2_4" value="4" <?php if ($this->do->do->S2 === '4') {print("checked");} ?>><label for="S2_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="S2" id="S2_5" value="5" <?php if ($this->do->do->S2 === '5') {print("checked");} ?>><label for="S2_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok segítenek katasztrófa és mentési helyzetekben <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="S3" id="S3_1" value="1" required <?php if ($this->do->do->S3 === '1') {print("checked");} ?>><label for="S3_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="S3" id="S3_2" value="2" <?php if ($this->do->do->S3 === '2') {print("checked");} ?>><label for="S3_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="S3" id="S3_3" value="3" <?php if ($this->do->do->S3 === '3') {print("checked");} ?>><label for="S3_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="S3" id="S3_4" value="4" <?php if ($this->do->do->S3 === '4') {print("checked");} ?>><label for="S3_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="S3" id="S3_5" value="5" <?php if ($this->do->do->S3 === '5') {print("checked");} ?>><label for="S3_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok alkalmazása sok esetben költséghatékonyabb megoldás az emberek bevetésénél <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="S4" id="S4_1" value="1" required <?php if ($this->do->do->S4 === '1') {print("checked");} ?>><label for="S4_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="S4" id="S4_2" value="2" <?php if ($this->do->do->S4 === '2') {print("checked");} ?>><label for="S4_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="S4" id="S4_3" value="3" <?php if ($this->do->do->S4 === '3') {print("checked");} ?>><label for="S4_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="S4" id="S4_4" value="4" <?php if ($this->do->do->S4 === '4') {print("checked");} ?>><label for="S4_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="S4" id="S4_5" value="5" <?php if ($this->do->do->S4 === '5') {print("checked");} ?>><label for="S4_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok mindennapi jelenléte zavaró zajterhelést okoz <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="W1" id="W1_1" value="1" required <?php if ($this->do->do->W1 === '1') {print("checked");} ?>><label for="W1_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="W1" id="W1_2" value="2" <?php if ($this->do->do->W1 === '2') {print("checked");} ?>><label for="W1_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="W1" id="W1_3" value="3" <?php if ($this->do->do->W1 === '3') {print("checked");} ?>><label for="W1_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="W1" id="W1_4" value="4" <?php if ($this->do->do->W1 === '4') {print("checked");} ?>><label for="W1_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="W1" id="W1_5" value="5" <?php if ($this->do->do->W1 === '5') {print("checked");} ?>><label for="W1_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok jelentős akadályt jelentenek infrastruktúrák üzemeltetésében <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="W2" id="W2_1" value="1" required <?php if ($this->do->do->W2 === '1') {print("checked");} ?>><label for="W2_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="W2" id="W2_2" value="2" <?php if ($this->do->do->W2 === '2') {print("checked");} ?>><label for="W2_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="W2" id="W2_3" value="3" <?php if ($this->do->do->W2 === '3') {print("checked");} ?>><label for="W2_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="W2" id="W2_4" value="4" <?php if ($this->do->do->W2 === '4') {print("checked");} ?>><label for="W2_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="W2" id="W2_5" value="5" <?php if ($this->do->do->W2 === '5') {print("checked");} ?>><label for="W2_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok technikailag nem teljesen megbízhatóak <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="W3" id="W3_1" value="1" required <?php if ($this->do->do->W3 === '1') {print("checked");} ?>><label for="W3_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="W3" id="W3_2" value="2" <?php if ($this->do->do->W3 === '2') {print("checked");} ?>><label for="W3_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="W3" id="W3_3" value="3" <?php if ($this->do->do->W3 === '3') {print("checked");} ?>><label for="W3_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="W3" id="W3_4" value="4" <?php if ($this->do->do->W3 === '4') {print("checked");} ?>><label for="W3_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="W3" id="W3_5" value="5" <?php if ($this->do->do->W3 === '5') {print("checked");} ?>><label for="W3_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok jelentős fizikai sérülési kockázatot jelentenek az alattuk tartózkodó emberekre nézve <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="W4" id="W4_1" value="1" required <?php if ($this->do->do->W4 === '1') {print("checked");} ?>><label for="W4_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="W4" id="W4_2" value="2" <?php if ($this->do->do->W4 === '2') {print("checked");} ?>><label for="W4_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="W4" id="W4_3" value="3" <?php if ($this->do->do->W4 === '3') {print("checked");} ?>><label for="W4_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="W4" id="W4_4" value="4" <?php if ($this->do->do->W4 === '4') {print("checked");} ?>><label for="W4_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="W4" id="W4_5" value="5" <?php if ($this->do->do->W4 === '5') {print("checked");} ?>><label for="W4_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok elterjedése új munkahelyeket teremt <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="O1" id="O1_1" value="1" required <?php if ($this->do->do->O1 === '1') {print("checked");} ?>><label for="O1_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="O1" id="O1_2" value="2" <?php if ($this->do->do->O1 === '2') {print("checked");} ?>><label for="O1_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="O1" id="O1_3" value="3" <?php if ($this->do->do->O1 === '3') {print("checked");} ?>><label for="O1_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="O1" id="O1_4" value="4" <?php if ($this->do->do->O1 === '4') {print("checked");} ?>><label for="O1_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="O1" id="O1_5" value="5" <?php if ($this->do->do->O1 === '5') {print("checked");} ?>><label for="O1_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok forradalmasíthatják az agrárszektort <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="O2" id="O2_1" value="1" required <?php if ($this->do->do->O2 === '1') {print("checked");} ?>><label for="O2_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="O2" id="O2_2" value="2" <?php if ($this->do->do->O2 === '2') {print("checked");} ?>><label for="O2_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="O2" id="O2_3" value="3" <?php if ($this->do->do->O2 === '3') {print("checked");} ?>><label for="O2_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="O2" id="O2_4" value="4" <?php if ($this->do->do->O2 === '4') {print("checked");} ?>><label for="O2_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="O2" id="O2_5" value="5" <?php if ($this->do->do->O2 === '5') {print("checked");} ?>><label for="O2_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok használata csökkentheti a közúti forgalmat és a környezetszennyezést <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="O3" id="O3_1" value="1" required <?php if ($this->do->do->O3 === '1') {print("checked");} ?>><label for="O3_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="O3" id="O3_2" value="2" <?php if ($this->do->do->O3 === '2') {print("checked");} ?>><label for="O3_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="O3" id="O3_3" value="3" <?php if ($this->do->do->O3 === '3') {print("checked");} ?>><label for="O3_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="O3" id="O3_4" value="4" <?php if ($this->do->do->O3 === '4') {print("checked");} ?>><label for="O3_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="O3" id="O3_5" value="5" <?php if ($this->do->do->O3 === '5') {print("checked");} ?>><label for="O3_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A dróntechnológia támogatja a tudományos kutatást és az innovációt <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="O4" id="O4_1" value="1" required <?php if ($this->do->do->O4 === '1') {print("checked");} ?>><label for="O4_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="O4" id="O4_2" value="2" <?php if ($this->do->do->O4 === '2') {print("checked");} ?>><label for="O4_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="O4" id="O4_3" value="3" <?php if ($this->do->do->O4 === '3') {print("checked");} ?>><label for="O4_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="O4" id="O4_4" value="4" <?php if ($this->do->do->O4 === '4') {print("checked");} ?>><label for="O4_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="O4" id="O4_5" value="5" <?php if ($this->do->do->O4 === '5') {print("checked");} ?>><label for="O4_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok elterjedése súlyosan veszélyezteti a magánéletet <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="T1" id="T1_1" value="1" required <?php if ($this->do->do->T1 === '1') {print("checked");} ?>><label for="T1_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="T1" id="T1_2" value="2" <?php if ($this->do->do->T1 === '2') {print("checked");} ?>><label for="T1_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="T1" id="T1_3" value="3" <?php if ($this->do->do->T1 === '3') {print("checked");} ?>><label for="T1_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="T1" id="T1_4" value="4" <?php if ($this->do->do->T1 === '4') {print("checked");} ?>><label for="T1_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="T1" id="T1_5" value="5" <?php if ($this->do->do->T1 === '5') {print("checked");} ?>><label for="T1_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok növelik a balesetek kockázatát a légtérben <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="T2" id="T2_1" value="1" required <?php if ($this->do->do->T2 === '1') {print("checked");} ?>><label for="T2_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="T2" id="T2_2" value="2" <?php if ($this->do->do->T2 === '2') {print("checked");} ?>><label for="T2_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="T2" id="T2_3" value="3" <?php if ($this->do->do->T2 === '3') {print("checked");} ?>><label for="T2_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="T2" id="T2_4" value="4" <?php if ($this->do->do->T2 === '4') {print("checked");} ?>><label for="T2_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="T2" id="T2_5" value="5" <?php if ($this->do->do->T2 === '5') {print("checked");} ?>><label for="T2_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónok könnyebbé teszik a rosszindulatú cselekmények elkövetését <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="T3" id="T3_1" value="1" required <?php if ($this->do->do->T3 === '1') {print("checked");} ?>><label for="T3_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="T3" id="T3_2" value="2" <?php if ($this->do->do->T3 === '2') {print("checked");} ?>><label for="T3_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="T3" id="T3_3" value="3" <?php if ($this->do->do->T3 === '3') {print("checked");} ?>><label for="T3_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="T3" id="T3_4" value="4" <?php if ($this->do->do->T3 === '4') {print("checked");} ?>><label for="T3_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="T3" id="T3_5" value="5" <?php if ($this->do->do->T3 === '5') {print("checked");} ?>><label for="T3_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>A drónszabályozás jelenlegi hiányosságai biztonsági kockázatot jelentenek <span class="required">*</span></label>
                            <div class="likert-scale">
                                <div class="likert-option"><input type="radio" name="T4" id="T4_1" value="1" required <?php if ($this->do->do->T4 === '1') {print("checked");} ?>><label for="T4_1">1</label></div>
                                <div class="likert-option"><input type="radio" name="T4" id="T4_2" value="2" <?php if ($this->do->do->T4 === '2') {print("checked");} ?>><label for="T4_2">2</label></div>
                                <div class="likert-option"><input type="radio" name="T4" id="T4_3" value="3" <?php if ($this->do->do->T4 === '3') {print("checked");} ?>><label for="T4_3">3</label></div>
                                <div class="likert-option"><input type="radio" name="T4" id="T4_4" value="4" <?php if ($this->do->do->T4 === '4') {print("checked");} ?>><label for="T4_4">4</label></div>
                                <div class="likert-option"><input type="radio" name="T4" id="T4_5" value="5" <?php if ($this->do->do->T4 === '5') {print("checked");} ?>><label for="T4_5">5</label></div>
                            </div>
                            <div class="likert-labels"><span>Nem értek egyet</span><span>Egyetértek</span></div>
                        </div>

                        <div class="form-group">
                            <label>Mi a legnagyobb félelme vagy reménye a drónokkal kapcsolatban?</label>
                            <textarea name="biggest_fear_hope" rows="4" placeholder="Írja le véleményét..."><?php echo $this->do->do->biggest_fear_hope; ?></textarea>
                        </div>

                        <button type="submit" name="create" value="Válaszok beküldése">Válaszok beküldése</button>

                    </form>
                </div>
            <?php } ?>

            <?php
        }

    }

?>