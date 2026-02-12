/**
 * map_report_correlation.js
 * Visualizes Pearson Correlation:
 * - Background (Voronoi): SO_Attitude (Red->Green)
 * - Markers: W1 Score (Light Blue->Dark Blue)
 * - Stats: Pearson r and p-value
 */

function initializeMap(data) {
    // --- 1. CONFIGURATION ---
    
    // Scale for SO_Attitude (Voronoi Background)
    // 1 (Negative) -> 3 (Neutral) -> 5 (Positive)
    var attitudeScale = d3.scaleLinear()
        .domain([1, 3, 5])
        .range(["#d73027", "#ffffbf", "#1a9850"]) 
        .clamp(true);

    // Scale for W1 (Marker Colors)
    // 1 (Low) -> 5 (High)
    var w1Scale = d3.scaleLinear()
        .domain([1, 5])
        .range(["#f7fbff", "#08306b"]) 
        .clamp(true);

    // --- 2. MAP SETUP ---
    
    // Define Base Layers
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

    // Initialize Map
    var map = L.map('map_full', {
        center: [47.0, 19.0],
        zoom: 7,
        layers: [cleanLayer]
    });

    // Add Layer Control
    L.control.layers({
        "Clean Map": cleanLayer,
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer
    }).addTo(map);

    if (!data || data.length === 0) {
        console.warn("No data available.");
        return;
    }

    // --- 3. DATA PROCESSING ---
    var formattedData = []; 
    var xValues = []; // W1
    var yValues = []; // SO_Attitude

    data.forEach(function(row) {
        // Parse the specific columns for this hypothesis
        var w1 = parseFloat(row.W1);
        var attitude = parseFloat(row.SO_Attitude);
        var lat = parseFloat(row.geo_responder_settlement_latitude);
        var lng = parseFloat(row.geo_responder_settlement_longitude);

        // Only include if all data points are valid numbers
        if (!isNaN(w1) && !isNaN(attitude) && !isNaN(lat) && !isNaN(lng)) {
            formattedData.push({
                lat: lat,
                lng: lng,
                w1: w1,
                attitude: attitude
            });
            xValues.push(w1);
            yValues.push(attitude);
        }
    });

    // --- 4. RENDER LAYERS ---
    
    // A. Voronoi Layer (Background color = Attitude)
    // We pass the attitudeScale so the polygons reflect the sentiment
    addVoronoiLayer(map, formattedData, attitudeScale);

    // B. Markers (Marker color = W1 Score)
    formattedData.forEach(function(d) {
        L.circleMarker([d.lat, d.lng], {
            color: "#333",       
            weight: 0.5,
            fillColor: w1Scale(d.w1),
            fillOpacity: 0.9,    
            radius: 5            
        })
        .bindPopup(`
            <div style="text-align:center; font-family:sans-serif;">
                <b>W1 Score:</b> ${d.w1}<br>
                <b>Attitude:</b> ${d.attitude.toFixed(2)}
            </div>
        `)
        .addTo(map);
    });

    // C. Legend
    addCorrelationLegend(map);

    // --- 5. RUN STATISTICS ---
    if (xValues.length > 2) {
        var stats = calculatePearsonR(xValues, yValues);
        displayCorrelationStats(stats);
    } else {
        document.getElementById('stats_content').innerHTML = "Insufficient data.";
    }
}

/**
 * Adds Voronoi overlay shaded by the provided colorScale (Attitude)
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

        // Check D3 version for compatibility
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
            // Color the polygon based on the ATTITUDE of the point it represents
            .attr("fill", d => colorScale(d.data.attitude))
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.3)
            .attr("fill-opacity", 0.35) 
            .style("pointer-events", "none"); 
    }

    draw();
    map.on('moveend', draw);
}

/**
 * Calculates Pearson Correlation Coefficient and p-value
 * Requires: jStat library for p-value (studentt distribution)
 * If jStat is not present, p-value will default to 'N/A'
 */
function calculatePearsonR(x, y) {
    var n = x.length;
    var sumX = d3.sum(x);
    var sumY = d3.sum(y);
    var sumXY = d3.sum(x.map((d, i) => d * y[i]));
    var sumX2 = d3.sum(x.map(d => d * d));
    var sumY2 = d3.sum(y.map(d => d * d));

    var num = (n * sumXY) - (sumX * sumY);
    var den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    
    var r = (den === 0) ? 0 : num / den;
    
    // Significance (p-value) Calculation
    var p = null;
    if (typeof jStat !== 'undefined') {
        var df = n - 2;
        var t = r * Math.sqrt(df / (1 - r * r));
        // Two-tailed p-value
        p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
    }

    return { r: r, p: p, n: n, sig: (p !== null && p < 0.05) };
}

/**
 * Updates the stats container with the Pearson results
 */
function displayCorrelationStats(stats) {
    var container = document.getElementById('stats_content');
    
    var pValueText = (stats.p !== null) ? stats.p.toFixed(5) : "N/A (jStat missing)";
    
    // Determine color and text based on significance
    var color = "#333";
    var sigText = "";
    
    if (stats.p !== null) {
        if (stats.sig) {
            color = "#27ae60"; // Green
            sigText = "<b>Significant Correlation.</b> (p < 0.05)";
        } else {
            color = "#c0392b"; // Red
            sigText = "<b>Not Significant.</b> (p >= 0.05)";
        }
    }

    var html = `
        <table style="width:100%; text-align: left; font-family: sans-serif; font-size: 13px; border-collapse: collapse;">
            <tr>
                <td style="padding: 4px 0;"><b>Pearson r:</b></td>
                <td style="padding: 4px 0;">${stats.r.toFixed(4)}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0;"><b>Sample Size (n):</b></td>
                <td style="padding: 4px 0;">${stats.n}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0;"><b>p-value:</b></td>
                <td style="padding: 4px 0;">${pValueText}</td>
            </tr>
            <tr>
                <td colspan="2" style="color:${color}; padding-top:8px; border-top: 1px solid #eee;">
                    ${sigText}
                </td>
            </tr>
        </table>
    `;
    container.innerHTML = html;
}

/**
 * Custom Legend for the Dual-Variable Map
 */
function addCorrelationLegend(map) {
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
            <div style="font-weight: bold; margin-bottom:5px;">W1 Score (Dots)</div>
            <div style="background: linear-gradient(to right, #f7fbff, #08306b); width: 100%; height: 10px; border-radius: 2px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 15px; color: #555;">
                <span>Low</span>
                <span>High</span>
            </div>
            
            <div style="font-weight: bold; margin-bottom:5px;">Attitude (Background)</div>
            <div style="background: linear-gradient(to right, #d73027, #ffffbf, #1a9850); width: 100%; height: 10px; border-radius: 2px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #555;">
                <span>Neg (1)</span>
                <span>Neut (3)</span>
                <span>Pos (5)</span>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}