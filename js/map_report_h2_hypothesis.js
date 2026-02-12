/**
 * map_report_h2_hypothesis.js
 * Visualizes H2 Hypothesis: "Women perceive drones as a greater risk (Lower Attitude) than men."
 * - Default Map: Clean (CartoDB)
 * - Markers: Gender (Blue = Male, Pink = Female)
 * - Voronoi: SO_Attitude (Red->Green Gradient)
 */

function initializeMap(data) {
    // --- 1. CONFIGURATION ---
    
    // Gender Colors (For the Dots)
    // Using distinct colors that stand out against the Red-Green background
    var colorMale = "#2980b9";   // Strong Blue
    var colorFemale = "#e91e63"; // Pink/Magenta
    var colorOther = "#7f8c8d";  // Grey (fallback)

    // Attitude Color Scale (For the Voronoi Background)
    // Domain: 1 (Negative/High Risk), 3 (Neutral), 5 (Positive/Low Risk)
    var attitudeScale = d3.scaleLinear()
        .domain([1, 3, 5])
        .range(["#d73027", "#ffffbf", "#1a9850"])
        .clamp(true);

    // --- 2. MAP SETUP ---
    
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap' 
    });
    
    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
        attribution: '&copy; Esri' 
    });
    
    var cleanLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { 
        attribution: '&copy; CARTO', 
        subdomains: 'abcd', 
        maxZoom: 20 
    });

    // Initialize Map (Default: Clean Layer)
    var map = L.map('map_full', {
        center: [47.0, 19.0],
        zoom: 7,
        layers: [cleanLayer] 
    });

    L.control.layers({
        "Clean Map": cleanLayer,
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer
    }).addTo(map);

    // Validate Data
    if (!data || data.length === 0) {
        console.warn("No data available.");
        document.getElementById('stats_content').innerHTML = "No data available.";
        return;
    }

    // --- 3. DATA PROCESSING ---
    var formattedData = []; 
    var groupMale = [];     
    var groupFemale = [];     

    data.forEach(function(row) {
        var attitude = parseFloat(row.SO_Attitude);
        // Ensure we handle case variations (e.g., "Male", "male", "Man")
        var rawGender = (row.gender || row.Gender || "").trim(); 
        var gender = normalizeGender(rawGender); 

        var lat = parseFloat(row.geo_responder_settlement_latitude);
        var lng = parseFloat(row.geo_responder_settlement_longitude);

        if (!isNaN(attitude) && !isNaN(lat) && !isNaN(lng)) {
            formattedData.push({
                lat: lat,
                lng: lng,
                group: gender, // "Male", "Female", or "Other"
                attitude: attitude
            });

            // Group for Statistics
            if (gender === "Male") groupMale.push(attitude);
            else if (gender === "Female") groupFemale.push(attitude);
        }
    });

    // --- 4. RENDER LAYERS ---
    
    // A. Voronoi Layer (Shaded by Attitude)
    addVoronoiLayer(map, formattedData, attitudeScale, colorMale, colorFemale);

    // B. Markers (Colored by Gender)
    formattedData.forEach(function(d) {
        var color;
        if (d.group === "Male") color = colorMale;
        else if (d.group === "Female") color = colorFemale;
        else color = colorOther;
        
        L.circleMarker([d.lat, d.lng], {
            color: "#333",       
            weight: 1,
            fillColor: color,
            fillOpacity: 1.0,    
            radius: 5            
        })
        .bindPopup(`
            <div style="text-align:center;">
                <b>Gender:</b> ${d.group}<br>
                <b>Attitude:</b> ${d.attitude.toFixed(2)}
            </div>
        `)
        .addTo(map);
    });

    // C. Legend
    addLegend(map, colorMale, colorFemale);

    // --- 5. RUN STATISTICS ---
    if (groupMale.length > 1 && groupFemale.length > 1) {
        var stats = calculateIndependentTTest(groupMale, groupFemale);
        displayStats(stats);
    } else {
        document.getElementById('stats_content').innerHTML = "Insufficient data to perform T-Test between genders.";
    }
}

/**
 * Helper to normalize gender strings
 */
function normalizeGender(str) {
    var lower = str.toLowerCase();
    if (lower === "male" || lower === "man" || lower === "ferfi") return "Male";
    if (lower === "female" || lower === "woman" || lower === "no" || lower === "nő") return "Female";
    return "Other";
}

/**
 * Adds Voronoi overlay shaded by Attitude Scale
 */
function addVoronoiLayer(map, data, colorScale) {
    var svgLayer = L.svg();
    svgLayer.addTo(map);
    
    var svg = d3.select("#map_full").select("svg");
    var g = svg.select("g"); 

    function draw() {
        g.selectAll("path").remove();

        var points = data.map(d => {
            var p = map.latLngToLayerPoint(new L.LatLng(d.lat, d.lng));
            return [p.x, p.y];
        });

        var polygons = [];

        // D3 Delaunay (v6+) or Voronoi (v5) check
        if (d3.Delaunay) {
            var bounds = map.getPixelBounds();
            var w = bounds.max.x - bounds.min.x;
            var h = bounds.max.y - bounds.min.y;
            var delaunay = d3.Delaunay.from(points);
            var voronoi = delaunay.voronoi([-1000, -1000, w + 1000, h + 1000]);
            
            polygons = points.map((p, i) => ({
                path: voronoi.renderCell(i),
                data: data[i]
            }));
        } else if (d3.voronoi) {
            var voronoi = d3.voronoi().extent([[-1000, -1000], [4000, 4000]]);
            var vPolygons = voronoi.polygons(points);
            polygons = vPolygons.map((poly, i) => ({
                path: poly ? "M" + poly.join("L") + "Z" : "",
                data: data[i]
            }));
        }

        g.selectAll("path")
            .data(polygons)
            .enter()
            .append("path")
            .attr("d", d => d.path)
            .attr("fill", d => colorScale(d.data.attitude)) // Fill by ATTITUDE
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.3)
            .attr("fill-opacity", 0.35) 
            .style("pointer-events", "none"); 
    }

    draw();
    map.on('moveend', draw);
}

/**
 * Legend for H2
 */
function addLegend(map, colorMale, colorFemale) {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = "white";
        div.style.padding = "10px";
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "4px";
        div.style.fontFamily = "Arial, sans-serif";
        div.style.fontSize = "12px";

        div.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom:5px;">Gender (Dots)</div>
            <div><span style="background:${colorMale}; width:10px; height:10px; display:inline-block; border-radius:50%; margin-right:5px;"></span>Male</div>
            <div style="margin-bottom:10px;"><span style="background:${colorFemale}; width:10px; height:10px; display:inline-block; border-radius:50%; margin-right:5px;"></span>Female</div>
            
            <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom:5px;">Attitude (Background)</div>
            <div style="background: linear-gradient(to right, #d73027, #ffffbf, #1a9850); width: 100%; height: 10px; border-radius: 2px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-top: 2px;">
                <span>1 (Neg)</span>
                <span>3 (Neut)</span>
                <span>5 (Pos)</span>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}

/**
 * T-Test Calculation
 */
function calculateIndependentTTest(sample1, sample2) {
    var n1 = sample1.length, n2 = sample2.length;
    var mean1 = getMean(sample1), mean2 = getMean(sample2);
    var var1 = getVariance(sample1, mean1), var2 = getVariance(sample2, mean2);
    var df = n1 + n2 - 2;
    var pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / df;
    var se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
    var tValue = (mean1 - mean2) / se;
    var pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tValue), df));
    return { meanMale: mean1, meanFemale: mean2, t: tValue, df: df, p: pValue, sig: pValue < 0.05 };
}

function getMean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function getVariance(arr, mean) { 
    if(arr.length < 2) return 0;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1); 
}

function displayStats(stats) {
    var container = document.getElementById('stats_content');
    var color = stats.sig ? "#27ae60" : "#c0392b";
    var sigText = stats.sig ? "<b>Supported.</b> Significant difference found." : "<b>Not Supported.</b> No significant difference.";

    var html = `
        <table style="width:100%; text-align: left; font-family: sans-serif; font-size: 13px;">
            <tr><td><b>Male (Mean):</b></td><td>${stats.meanMale.toFixed(3)}</td></tr>
            <tr><td><b>Female (Mean):</b></td><td>${stats.meanFemale.toFixed(3)}</td></tr>
            <tr><td><b>t-value:</b></td><td>${stats.t.toFixed(3)}</td></tr>
            <tr><td><b>p-value:</b></td><td>${stats.p.toFixed(5)}</td></tr>
            <tr><td colspan="2" style="color:${color}; padding-top:5px;">${sigText}</td></tr>
        </table>
    `;
    container.innerHTML = html;
}