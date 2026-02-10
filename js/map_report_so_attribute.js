/**
 * THESIS MAP: SO ATTRIBUTE (STRENGTHS + OPPORTUNITIES)
 * Visualizes "Optimism" - Where people see value and potential.
 */

let map;

function initializeMap(rawData) {

    // ============================================================
    // 1. DATA PROCESSING
    // ============================================================
    
    let locationMap = {};
    let minScore = 40; // Max possible is 40 (5 * 8 questions)
    let maxScore = 0;

    rawData.forEach(item => {
        const key = `${item.geo_responder_settlement_latitude}_${item.geo_responder_settlement_longitude}`;
        
        // Helper to parse integers (Default to 3 'Neutral' if empty)
        const v = (val) => parseInt(val) || 3;

        // Calculate SO Score (Positive Potential)
        // Internal Strengths (S1-S4) + External Opportunities (O1-O4)
        let soScore = 
            v(item.S1) + v(item.S2) + v(item.S3) + v(item.S4) +
            v(item.O1) + v(item.O2) + v(item.O3) + v(item.O4);

        if (!locationMap[key]) {
            locationMap[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal: item.responder_postal_code,
                sumSO: 0,
                count: 0
            };
        }
        locationMap[key].sumSO += soScore;
        locationMap[key].count += 1;
    });

    // Convert to Array
    const aggregatedData = Object.values(locationMap).map(loc => {
        let avg = loc.sumSO / loc.count;
        
        // Track min/max for dynamic scaling if needed
        if (avg < minScore) minScore = avg;
        if (avg > maxScore) maxScore = avg;

        return {
            lat: loc.lat,
            lng: loc.lng,
            postal: loc.postal,
            avgSO: avg,
            count: loc.count
        };
    });


    // ============================================================
    // 2. MAP SETUP
    // ============================================================
    
    L.Browser.any3d = false; // Fix for screenshot tools

    map = L.map('map_full', {
        center: [47.165, 19.509], // Hungary
        zoom: 7,
        preferCanvas: true
    });

    // Create a specific Pane for Voronoi so it stays in the background
    map.createPane('voronoiPane');
    map.getPane('voronoiPane').style.zIndex = 200;

    // Base Layer (Clean/Light)
    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd'
    }).addTo(map);

    const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });


    // ============================================================
    // 3. COLOR SCALE: "The Sunrise" (Optimism)
    // ============================================================
    // High SO = Deep Orange/Gold (High Value)
    // Low SO  = Pale Yellow/Grey (Low Value/Apathy)

    function getOptimismColor(score) {
        // Theoretical Range: 8 (All 1s) to 40 (All 5s). Neutral is 24.
        if (score >= 32) return '#bd0026'; // Deepest Red-Orange (High Optimism)
        if (score >= 28) return '#f03b20';
        if (score >= 24) return '#fd8d3c'; // Orange (Neutral/Positive)
        if (score >= 20) return '#feb24c';
        if (score >= 16) return '#fed976'; // Yellow
        return '#ffffb2';                  // Pale Yellow (Low Optimism)
    }


    // ============================================================
    // 4. LAYER: VORONOI OPTIMISM ZONES
    // ============================================================
    
    const voronoiLayer = L.layerGroup();

    function drawVoronoi() {
        voronoiLayer.clearLayers();

        // 1. Map Points
        const points = aggregatedData.map(d => {
            const point = map.latLngToLayerPoint([d.lat, d.lng]);
            point.data = d; 
            return point;
        });

        // 2. Fixed Geographic Bounds (Europe/Regional)
        let minLat = 34, minLng = -13, maxLat = 75, maxLng = 64;
        const p1 = map.latLngToLayerPoint([maxLat, minLng]);
        const p2 = map.latLngToLayerPoint([minLat, maxLng]);
        
        const delaunay = d3.Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([
            Math.min(p1.x, p2.x), Math.min(p1.y, p2.y),
            Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)
        ]);

        // 3. Draw
        for (let i = 0; i < points.length; i++) {
            const cell = voronoi.cellPolygon(i);
            if (cell) {
                const latLngs = cell.map(p => map.layerPointToLatLng([p[0], p[1]]));
                const d = points[i].data;

                const poly = L.polygon(latLngs, {
                    pane: 'voronoiPane', // Send to back
                    fillColor: getOptimismColor(d.avgSO),
                    fillOpacity: 0.5,
                    weight: 1,
                    color: 'white',
                    opacity: 0.4
                });

                poly.bindTooltip(`
                    <b>${d.postal}</b><br>
                    Optimism Score: ${d.avgSO.toFixed(1)} / 40
                `, { sticky: true });

                voronoiLayer.addLayer(poly);
            }
        }
    }

    drawVoronoi();
    map.on('zoomend', drawVoronoi);


    // ============================================================
    // 5. LAYER: OPPORTUNITY BUBBLES
    // ============================================================
    
    const bubbleLayer = L.layerGroup();

    aggregatedData.forEach(d => {
        // Size = Number of people
        const radius = 6 + (Math.sqrt(d.count) * 4);
        
        const circle = L.circleMarker([d.lat, d.lng], {
            radius: radius,
            fillColor: getOptimismColor(d.avgSO),
            color: '#444',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        });

        circle.bindPopup(`
            <div style="text-align:center; min-width:120px;">
                <h3>${d.postal}</h3>
                <span style="color:#666; font-size:11px;">${d.count} Respondents</span>
                <hr style="margin:5px 0;">
                <div style="
                    background:${getOptimismColor(d.avgSO)}; 
                    color:white; padding:5px; border-radius:4px; font-weight:bold;
                    text-shadow: 0 0 3px #000;
                ">
                    S+O Score: ${d.avgSO.toFixed(1)}
                </div>
                <div style="font-size:10px; margin-top:5px; color:#555;">
                    (Max Possible: 40)
                </div>
            </div>
        `);

        bubbleLayer.addLayer(circle);
    });


    // ============================================================
    // 6. LAYER: HEATMAP (Concentration of Optimism)
    // ============================================================
    
    // We weigh the heatmap by the score. 
    // Higher Score = More Intensity.
    const heatPoints = aggregatedData.map(d => [
        d.lat, 
        d.lng, 
        (d.avgSO / 40) * 1.5 // Normalize to 0-1 range, then boost slightly
    ]);

    const heatLayer = L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        gradient: {
            0.4: '#fed976', // Yellow
            0.6: '#fd8d3c', // Orange
            0.8: '#f03b20', // Red-Orange
            1.0: '#bd0026'  // Deep Red
        }
    });


    // ============================================================
    // 7. CONTROLS & LEGEND
    // ============================================================

    const baseMaps = { "Clean Map": baseLayer, "Satellite": satelliteLayer };
    const overlayMaps = {
        "Voronoi (Regions)": voronoiLayer,
        "Optimism Bubbles": bubbleLayer,
        "Heatmap (Intensity)": heatLayer
    };

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
    voronoiLayer.addTo(map);

    // Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.background = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        
        div.innerHTML = `
            <strong>Optimism (S+O)</strong><br>
            <small>Strengths + Opportunities</small><br>
            <div style="line-height:18px; margin-top:5px;">
                <i style="background:#bd0026; width:12px; height:12px; display:inline-block;"></i> High Potential (32+)<br>
                <i style="background:#fd8d3c; width:12px; height:12px; display:inline-block;"></i> Moderate (24-32)<br>
                <i style="background:#ffffb2; width:12px; height:12px; display:inline-block; border:1px solid #ccc;"></i> Low/Unsure (< 20)<br>
            </div>
        `;
        return div;
    };
    legend.addTo(map);

    // Screenshot Tool
    if (L.simpleMapScreenshoter) {
        new L.simpleMapScreenshoter({ hidden: true }).addTo(map);
    }
}