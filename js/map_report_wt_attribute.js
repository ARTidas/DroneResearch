/**
 * THESIS MAP: WT ATTRIBUTE (WEAKNESSES + THREATS)
 * Visualizes "Resistance" - Fear, Privacy Concerns, and Perceived Risks.
 */

let map;

function initializeMap(rawData) {

    // ============================================================
    // 1. DATA PROCESSING
    // ============================================================
    
    let locationMap = {};

    rawData.forEach(item => {
        const key = `${item.geo_responder_settlement_latitude}_${item.geo_responder_settlement_longitude}`;
        
        // Helper: safe parse
        const v = (val) => parseInt(val) || 3;

        // Calculate WT Score (Negative Perception)
        // Internal Weaknesses (W1-W4) + External Threats (T1-T4)
        // High Score = High Fear/Resistance
        let wtScore = 
            v(item.W1) + v(item.W2) + v(item.W3) + v(item.W4) +
            v(item.T1) + v(item.T2) + v(item.T3) + v(item.T4);

        if (!locationMap[key]) {
            locationMap[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal: item.responder_postal_code,
                sumWT: 0,
                count: 0
            };
        }
        locationMap[key].sumWT += wtScore;
        locationMap[key].count += 1;
    });

    // Convert to Array
    const aggregatedData = Object.values(locationMap).map(loc => {
        return {
            lat: loc.lat,
            lng: loc.lng,
            postal: loc.postal,
            avgWT: loc.sumWT / loc.count, // Average Fear Score (8 to 40)
            count: loc.count
        };
    });


    // ============================================================
    // 2. MAP SETUP
    // ============================================================
    
    L.Browser.any3d = false; 

    map = L.map('map_full', {
        center: [47.165, 19.509], // Hungary
        zoom: 7,
        preferCanvas: true
    });

    // Background Pane for Voronoi
    map.createPane('voronoiPane');
    map.getPane('voronoiPane').style.zIndex = 200;

    // Base Layer
    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd'
    }).addTo(map);

    const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });


    // ============================================================
    // 3. COLOR SCALE: "The Warning" (Fear/Risk)
    // ============================================================
    // High WT = Dark Maroon/Purple (High Fear)
    // Low WT  = Pale Yellow/White (Calm/Low Fear)

    function getFearColor(score) {
        // Theoretical Range: 8 to 40. 
        if (score >= 32) return '#67000d'; // Black-Red (Extreme Resistance)
        if (score >= 28) return '#a50f15'; // Deep Red
        if (score >= 24) return '#ef3b2c'; // Red (High Concern)
        if (score >= 20) return '#fc9272'; // Salmon
        if (score >= 16) return '#fcbba1'; // Pale Red
        return '#fff5f0';                  // Very Pale (Low Concern)
    }


    // ============================================================
    // 4. LAYER: VORONOI RESISTANCE ZONES
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

        // 2. Fixed Geographic Bounds
        let minLat = 34, minLng = -13, maxLat = 75, maxLng = 64;
        const p1 = map.latLngToLayerPoint([maxLat, minLng]);
        const p2 = map.latLngToLayerPoint([minLat, maxLng]);
        
        const delaunay = d3.Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([
            Math.min(p1.x, p2.x), Math.min(p1.y, p2.y),
            Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)
        ]);

        // 3. Draw Polygons
        for (let i = 0; i < points.length; i++) {
            const cell = voronoi.cellPolygon(i);
            if (cell) {
                const latLngs = cell.map(p => map.layerPointToLatLng([p[0], p[1]]));
                const d = points[i].data;

                const poly = L.polygon(latLngs, {
                    pane: 'voronoiPane',
                    fillColor: getFearColor(d.avgWT),
                    fillOpacity: 0.6, // Slightly higher opacity to show "danger" zones clearly
                    weight: 1,
                    color: 'white',
                    opacity: 0.4
                });

                poly.bindTooltip(`
                    <b>${d.postal}</b><br>
                    Fear Score: ${d.avgWT.toFixed(1)} / 40
                `, { sticky: true });

                voronoiLayer.addLayer(poly);
            }
        }
    }

    drawVoronoi();
    map.on('zoomend', drawVoronoi);


    // ============================================================
    // 5. LAYER: FEAR BUBBLES
    // ============================================================
    
    const bubbleLayer = L.layerGroup();

    aggregatedData.forEach(d => {
        const radius = 6 + (Math.sqrt(d.count) * 4);
        
        const circle = L.circleMarker([d.lat, d.lng], {
            radius: radius,
            fillColor: getFearColor(d.avgWT),
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
                    background:${getFearColor(d.avgWT)}; 
                    color:${d.avgWT > 20 ? 'white' : 'black'}; 
                    padding:5px; border-radius:4px; font-weight:bold;
                ">
                    W+T Score: ${d.avgWT.toFixed(1)}
                </div>
                <div style="font-size:10px; margin-top:5px; color:#555;">
                    High Score = High Resistance
                </div>
            </div>
        `);

        bubbleLayer.addLayer(circle);
    });


    // ============================================================
    // 6. LAYER: RISK HEATMAP
    // ============================================================
    
    // Weighted by Fear Score
    const heatPoints = aggregatedData.map(d => [
        d.lat, 
        d.lng, 
        (d.avgWT / 40) * 1.5 // Normalize and boost
    ]);

    const heatLayer = L.heatLayer(heatPoints, {
        radius: 35, // Larger radius to show "Zones of Anxiety"
        blur: 20,
        gradient: {
            0.4: '#fc9272', // Salmon
            0.65: '#ef3b2c', // Red
            0.9: '#67000d'   // Dark Maroon
        }
    });


    // ============================================================
    // 7. CONTROLS & LEGEND
    // ============================================================

    const baseMaps = { "Clean Map": baseLayer, "Satellite": satelliteLayer };
    const overlayMaps = {
        "Voronoi (Fear Zones)": voronoiLayer,
        "Resistance Bubbles": bubbleLayer,
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
            <strong>Resistance (W+T)</strong><br>
            <small>Weaknesses + Threats</small><br>
            <div style="line-height:18px; margin-top:5px;">
                <i style="background:#67000d; width:12px; height:12px; display:inline-block;"></i> Extreme Fear (32+)<br>
                <i style="background:#ef3b2c; width:12px; height:12px; display:inline-block;"></i> High Concern (24-32)<br>
                <i style="background:#fcbba1; width:12px; height:12px; display:inline-block;"></i> Moderate (16-24)<br>
                <i style="background:#fff5f0; width:12px; height:12px; display:inline-block; border:1px solid #ccc;"></i> Low Concern (< 16)<br>
            </div>
        `;
        return div;
    };
    legend.addTo(map);

    if (L.simpleMapScreenshoter) {
        new L.simpleMapScreenshoter({ hidden: true }).addTo(map);
    }
}