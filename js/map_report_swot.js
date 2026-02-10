/**
 * THESIS MAP: SWOT NET ATTITUDE (VORONOI + BUBBLES)
 * * Visualization 1: Bubbles (Point intensity)
 * Visualization 2: Voronoi (Territorial dominance)
 */

let map;

function initializeMap(rawData) {

    // ============================================================
    // 1. DATA PROCESSING
    // ============================================================
    
    // We need to aggregate data by unique location
    let settlementData = {};

    rawData.forEach(item => {
        const key = `${item.geo_responder_settlement_latitude}_${item.geo_responder_settlement_longitude}`;
        
        // Helper: safe integer parsing
        const val = (v) => {
            let n = parseInt(v);
            return isNaN(n) ? 3 : n; // Default to neutral (3) if missing
        };

        // 1. Calculate Individual Scores
        // (Strengths + Opportunities)
        let positiveScore = 
            val(item.S1) + val(item.S2) + val(item.S3) + val(item.S4) +
            val(item.O1) + val(item.O2) + val(item.O3) + val(item.O4);

        // (Weaknesses + Threats)
        let negativeScore = 
            val(item.W1) + val(item.W2) + val(item.W3) + val(item.W4) +
            val(item.T1) + val(item.T2) + val(item.T3) + val(item.T4);

        // Net Attitude
        let netScore = positiveScore - negativeScore;

        // 2. Aggregate
        if (!settlementData[key]) {
            settlementData[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal: item.responder_postal_code,
                sumNet: 0,
                count: 0
            };
        }
        settlementData[key].sumNet += netScore;
        settlementData[key].count += 1;
    });

    // Convert object to array for D3 and iteration
    const mapData = Object.values(settlementData).map(loc => {
        return {
            lat: loc.lat,
            lng: loc.lng,
            postal: loc.postal,
            avgNet: loc.sumNet / loc.count, // The metric for Voronoi coloring
            count: loc.count
        };
    });


    // ============================================================
    // 2. MAP SETUP
    // ============================================================
    L.Browser.any3d = false; // Fix for screenshot exports

    map = L.map('map_full', {
        center: [47.165, 19.509], // Center of Hungary
        zoom: 7,
        preferCanvas: true
    });

    // --- NEW: CREATE CUSTOM PANE FOR VORONOI ---
    // We create a specific "slice" of the map stack for the Voronoi layer.
    // Z-Index 200 is below the default marker pane (400) and overlay pane (400).
    map.createPane('voronoiPane');
    map.getPane('voronoiPane').style.zIndex = 200;

    // Base Maps
    const lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd'
    }).addTo(map);

    const satelliteMap = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true
    });


    // ============================================================
    // 3. COLOR SCALE (Shared by both layers)
    // ============================================================

    // Diverging Scale: Red (Negative) <-> Yellow <-> Green (Positive)
    function getColor(score) {
        if (score >= 8)  return '#1a9850'; // Deep Green (Very Optimistic)
        if (score >= 2)  return '#91cf60'; // Green (Optimistic)
        if (score <= -8) return '#d73027'; // Deep Red (Very Pessimistic)
        if (score <= -2) return '#fc8d59'; // Orange (Pessimistic)
        return '#ffffbf';                  // Pale Yellow (Neutral)
    }



    // ============================================================
    // 4. LAYER A: VORONOI TERRITORIES (Fixed for Dragging)
    // ============================================================
    const voronoiLayer = L.layerGroup();

    function drawVoronoi() {
        voronoiLayer.clearLayers();

        // Safety check
        if (mapData.length === 0) return;

        // 1. Calculate the Bounds of your DATA (not the screen)
        // Initialize with the first point
        /*let minLat = mapData[0].lat, maxLat = mapData[0].lat;
        let minLng = mapData[0].lng, maxLng = mapData[0].lng;*/
        let minLat = 34;
        let minLng = -13;
        let maxLat = 75;
        let maxLng = 64;

        // Find the extremes
        mapData.forEach(d => {
            if (d.lat < minLat) minLat = d.lat;
            if (d.lat > maxLat) maxLat = d.lat;
            if (d.lng < minLng) minLng = d.lng;
            if (d.lng > maxLng) maxLng = d.lng;
        });

        // Add some "padding" so the outer cells don't cut off right at the village edge
        // roughly ~0.5 degrees padding
        const padding = 0.5;
        const southWest = map.latLngToLayerPoint([minLat - padding, minLng - padding]);
        const northEast = map.latLngToLayerPoint([maxLat + padding, maxLng + padding]);

        // 2. Map Lat/Lng to Pixel Coordinates
        const points = mapData.map(d => {
            const point = map.latLngToLayerPoint([d.lat, d.lng]);
            point.data = d; 
            return point;
        });

        // 3. D3 Delaunay Calculation
        // We use the pixel bounds of the DATA, not the screen
        const x0 = Math.min(southWest.x, northEast.x);
        const y0 = Math.min(southWest.y, northEast.y);
        const x1 = Math.max(southWest.x, northEast.x);
        const y1 = Math.max(southWest.y, northEast.y);

        const delaunay = d3.Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([x0, y0, x1, y1]);

        // 4. Draw Polygons
        for (let i = 0; i < points.length; i++) {
            const cell = voronoi.cellPolygon(i);
            
            if (cell) {
                // Convert pixels back to LatLng
                const latLngs = cell.map(p => map.layerPointToLatLng([p[0], p[1]]));
                
                const d = points[i].data;
                const color = getColor(d.avgNet);

                const poly = L.polygon(latLngs, {
                    // --- ASSIGN TO THE NEW PANE ---
                    pane: 'voronoiPane',
                    // ------------------------------
                    fillColor: color,
                    fillOpacity: 0.45,
                    weight: 1,
                    color: '#fff',
                    opacity: 0.5
                });

                poly.bindTooltip(`
                    <b>${d.postal}</b><br>
                    Net Attitude: ${d.avgNet > 0 ? '+' : ''}${d.avgNet.toFixed(1)}
                `, { sticky: true });

                voronoiLayer.addLayer(poly);
            }
        }
    }

    // Voronoi requires redrawing on zoom/move because pixel coords change
    drawVoronoi();
    map.on('zoomend', drawVoronoi);



    // ============================================================
    // 5. LAYER B: BUBBLES (Standard Dot Map)
    // ============================================================
    const bubbleLayer = L.layerGroup();

    mapData.forEach(d => {
        // Size based on respondent count
        const radius = 5 + (Math.sqrt(d.count) * 5);

        const circle = L.circleMarker([d.lat, d.lng], {
            radius: radius,
            fillColor: getColor(d.avgNet),
            color: '#555',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        });

        circle.bindPopup(`
            <div style="text-align:center">
                <b>${d.postal}</b><br>
                ${d.count} Respondents<br>
                <hr style="margin:5px 0">
                <strong style="color:${getColor(d.avgNet)}">
                    Net: ${d.avgNet > 0 ? '+' : ''}${d.avgNet.toFixed(1)}
                </strong>
            </div>
        `);

        bubbleLayer.addLayer(circle);
    });


    // ============================================================
    // 6. CONTROLS & LEGEND
    // ============================================================

    // Layer Control
    const baseMaps = { "Clean Map": lightMap, "Satellite": satelliteMap };
    const overlayMaps = { 
        "Voronoi Territories": voronoiLayer, 
        "Attitude Bubbles": bubbleLayer 
    };

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Default View
    bubbleLayer.addTo(map);
    voronoiLayer.addTo(map);
    

    // Legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.style.background = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "4px";
        div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        
        div.innerHTML = `
            <strong>Net Attitude (SWOT)</strong><br>
            <small>(Str+Opp) - (Weak+Thr)</small><br>
            <div style="margin-top:5px; line-height:18px;">
                <i style="background:#1a9850; width:12px; height:12px; display:inline-block; border-radius:50%"></i> Optimistic (+8)<br>
                <i style="background:#91cf60; width:12px; height:12px; display:inline-block; border-radius:50%"></i> Pro-Drone (+2)<br>
                <i style="background:#ffffbf; width:12px; height:12px; display:inline-block; border-radius:50%; border:1px solid #ccc"></i> Neutral (~0)<br>
                <i style="background:#fc8d59; width:12px; height:12px; display:inline-block; border-radius:50%"></i> Anti-Drone (-2)<br>
                <i style="background:#d73027; width:12px; height:12px; display:inline-block; border-radius:50%"></i> Resistant (-8)
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