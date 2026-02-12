/**
 * map_report_h3_hypothesis.js
 * Visualizes H3 Hypothesis: "WT_Attitude varies by Residence (Urban vs Rural)."
 * - Default Map: Clean (CartoDB)
 * - Markers: Residence (Purple = Urban, Orange = Rural)
 * - Voronoi: WT_Attitude (Red->Green Gradient)
 */

function initializeMap(data) {
    // --- 1. CONFIGURATION ---
    
    // Residence Colors (For the Dots)
    var colorUrban = "#9b59b6"; // Purple
    var colorRural = "#e67e22"; // Orange
    var colorOther = "#95a5a6"; // Grey (fallback)

    // Attitude Color Scale (For the Voronoi Background)
    // WT_Attitude: 1 (Negative) -> 5 (Positive)
    var attitudeScale = d3.scaleLinear()
        .domain([1, 3, 5])
        .range(["#d73027", "#ffffbf", "#1a9850"])
        .clamp(true);

    // --- 2. MAP SETUP ---
    
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });
    var cleanLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });

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
    var groupUrban = [];     
    var groupRural = [];     

    data.forEach(function(row) {
        var attitude = parseFloat(row.WT_Attitude);
        // Normalize: trim whitespace and handle case sensitivity
        var resType = row.settlement_group;
        
        // Standardize to Title Case for display
        if (resType.toLowerCase() === "urban") resType = "Urban";
        else if (resType.toLowerCase() === "rural") resType = "Rural";

        var lat = parseFloat(row.geo_responder_settlement_latitude);
        var lng = parseFloat(row.geo_responder_settlement_longitude);

        if (!isNaN(attitude) && !isNaN(lat) && !isNaN(lng)) {
            formattedData.push({
                lat: lat,
                lng: lng,
                group: resType,
                attitude: attitude
            });

            // Group for Statistics
            if (resType === "Urban") groupUrban.push(attitude);
            else if (resType === "Rural") groupRural.push(attitude);
        }
    });

    // --- 4. RENDER LAYERS ---
    
    // A. Voronoi Layer (Shaded by WT_Attitude)
    addVoronoiLayer(map, formattedData, attitudeScale, colorUrban, colorRural);

    // B. Markers (Colored by Residence)
    formattedData.forEach(function(d) {
        var color;
        if (d.group === "Urban") color = colorUrban;
        else if (d.group === "Rural") color = colorRural;
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
                <b>Residence:</b> ${d.group}<br>
                <b>WT Attitude:</b> ${d.attitude.toFixed(2)}
            </div>
        `)
        .addTo(map);
    });

    // C. Legend
    addLegend(map, colorUrban, colorRural);

    // --- 5. RUN STATISTICS ---
    if (groupUrban.length > 1 && groupRural.length > 1) {
        var stats = calculateIndependentTTest(groupUrban, groupRural);
        displayStats(stats);
    } else {
        document.getElementById('stats_content').innerHTML = "Insufficient data to perform T-Test (Need both Urban and Rural data).";
    }
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
            .attr("fill", d => colorScale(d.data.attitude)) // Shaded by WT_Attitude
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.3)
            .attr("fill-opacity", 0.35) 
            .style("pointer-events", "none"); 
    }

    draw();
    map.on('moveend', draw);
}

/**
 * Legend for H3
 */
function addLegend(map, colorUrban, colorRural) {
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
            <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom:5px;">Residence (Dots)</div>
            <div><span style="background:${colorUrban}; width:10px; height:10px; display:inline-block; border-radius:50%; margin-right:5px;"></span>Urban</div>
            <div style="margin-bottom:10px;"><span style="background:${colorRural}; width:10px; height:10px; display:inline-block; border-radius:50%; margin-right:5px;"></span>Rural</div>
            
            <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom:5px;">WT Attitude (Background)</div>
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
    return { meanUrban: mean1, meanRural: mean2, t: tValue, df: df, p: pValue, sig: pValue < 0.05 };
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
            <tr><td><b>Urban (Mean):</b></td><td>${stats.meanUrban.toFixed(3)}</td></tr>
            <tr><td><b>Rural (Mean):</b></td><td>${stats.meanRural.toFixed(3)}</td></tr>
            <tr><td><b>t-value:</b></td><td>${stats.t.toFixed(3)}</td></tr>
            <tr><td><b>p-value:</b></td><td>${stats.p.toFixed(5)}</td></tr>
            <tr><td colspan="2" style="color:${color}; padding-top:5px;">${sigText}</td></tr>
        </table>
    `;
    container.innerHTML = html;
}