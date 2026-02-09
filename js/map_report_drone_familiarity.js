let map;

/**
 * Main Initialization Function
 * @param {Array} rawData - The JSON array from your PHP MapReportDao
 */
function initializeMap(rawData) {

    // ============================================================
    // 1. DATA PROCESSING
    // ============================================================
    
    // A. Aggregate Data for Voronoi (Averages)
    let locationMap = {};
    
    // C. Aggregate Data for Pie Charts (Counts per level) <--- NEW PART
    let pieData = {}; 

    rawData.forEach(item => {
        // Create unique key
        const key = `${item.geo_responder_settlement_latitude}_${item.geo_responder_settlement_longitude}`;
        const famScore = parseInt(item.drone_familiarity) || 1; 

        // --- Logic for Voronoi (Averages) ---
        if (!locationMap[key]) {
            locationMap[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal_code: item.responder_postal_code,
                sumFamiliarity: 0,
                count: 0
            };
        }
        locationMap[key].sumFamiliarity += famScore;
        locationMap[key].count += 1;

        // --- Logic for Pie Charts (Counts) ---
        if (!pieData[key]) {
            pieData[key] = {
                lat: parseFloat(item.geo_responder_settlement_latitude),
                lng: parseFloat(item.geo_responder_settlement_longitude),
                postal: item.responder_postal_code,
                total: 0,
                counts: [0, 0, 0, 0] // Index 0=Level 1, Index 3=Level 4
            };
        }
        // Map Familiarity 1-4 to Array Index 0-3
        if (famScore >= 1 && famScore <= 4) {
            pieData[key].counts[famScore - 1]++;
            pieData[key].total++;
        }
    });

    // Convert Voronoi map back to array for D3
    const aggregatedData = Object.values(locationMap).map(loc => {
        return {
            lat: loc.lat,
            lng: loc.lng,
            postal_code: loc.postal_code,
            avgFamiliarity: loc.sumFamiliarity / loc.count,
            responderCount: loc.count
        };
    });


    // B. Split Data for Heatmaps (More vs Less)
    // We filter the raw data directly here
    const moreFamiliarData = rawData.filter(i => i.drone_familiarity_group === 'More');
    const lessFamiliarData = rawData.filter(i => i.drone_familiarity_group === 'Less');


    // ============================================================
    // 2. MAP SETUP
    // ============================================================
    
    // Fix for screenshot distortion
    L.Browser.any3d = false; 

    const center = [47.165, 19.509]; // Hungary Center
    map = L.map('map_full', {
        center: center,
        zoom: 7,
        preferCanvas: true
    });

    // Base Layers
    const CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        crossOrigin: true
    }).addTo(map);

    const GoogleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });


    // ============================================================
    // 3. LAYER: VORONOI DIAGRAM (Territory Analysis)
    // ============================================================
    
    const voronoiLayer = L.layerGroup();

    function drawVoronoi() {
        voronoiLayer.clearLayers();

        // 1. Map data to pixel coordinates
        const points = aggregatedData.map(d => {
            const point = map.latLngToLayerPoint([d.lat, d.lng]);
            point.data = d; 
            return point;
        });

        // 2. Generate Voronoi
        const width = map.getSize().x;
        const height = map.getSize().y;
        const delaunay = d3.Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([0, 0, width, height]);

        // 3. Draw Polygons
        for (let i = 0; i < points.length; i++) {
            const cellPoly = voronoi.cellPolygon(i);
            
            if (cellPoly) {
                const latLngs = cellPoly.map(p => map.layerPointToLatLng([p[0], p[1]]));
                const score = points[i].data.avgFamiliarity;

                // Color Scheme: Red (Novice) -> Yellow -> Green (Expert)
                let color;
                if (score >= 3.5) color = '#006d2c';      // Deep Green (High Expert)
                else if (score >= 2.5) color = '#66c2a4'; // Light Green (Familiar)
                else if (score >= 1.5) color = '#fc8d59'; // Orange (Aware)
                else color = '#d73027';                   // Red (Novice)

                const poly = L.polygon(latLngs, {
                    fillColor: color,
                    weight: 1,
                    color: 'white',
                    opacity: 0.3,
                    fillOpacity: 0.45 // Transparent enough to see map labels
                });

                // Tooltip
                poly.bindTooltip(`
                    <b>Postal: ${points[i].data.postal_code}</b><br>
                    Avg Score: ${score.toFixed(2)}<br>
                    Based on ${points[i].data.responderCount} responses
                `, { sticky: true });
                
                voronoiLayer.addLayer(poly);
            }
        }
    }

    // Initial Draw & Zoom Handler
    drawVoronoi();
    map.on('zoomend', drawVoronoi); // Re-calculate on zoom because pixel coords change
    map.on('moveend', drawVoronoi); // Re-calculate on pan


    // ============================================================
    // 4. LAYER: HEATMAPS (Split Analysis)
    // ============================================================

    // Helper to format data for leaflet-heat: [lat, lng, intensity]
    const toHeatPoints = (dataset) => dataset.map(d => [
        parseFloat(d.geo_responder_settlement_latitude),
        parseFloat(d.geo_responder_settlement_longitude),
        1.0 // Uniform intensity (showing density of people, not score)
    ]);

    // A. "Less Familiar" Layer (Blue/Cool)
    const heatLess = L.heatLayer(toHeatPoints(lessFamiliarData), {
        radius: 35,          // Broader radius for "general public"
        blur: 25,            // Smooth blur
        minOpacity: 0.2,     // Very transparent at edges
        gradient: { 
            0.4: 'rgba(200, 200, 255, 0.4)', // Faint Blue
            0.7: 'rgba(100, 100, 255, 0.6)', // Med Blue
            1.0: 'rgba(0, 0, 255, 0.7)'      // Solid Blue
        }
    });

    // B. "More Familiar" Layer (Red/Hot)
    const heatMore = L.heatLayer(toHeatPoints(moreFamiliarData), {
        radius: 25,          // Tighter radius for "experts"
        blur: 15,
        minOpacity: 0.2,
        gradient: {
            0.4: 'rgba(255, 200, 100, 0.5)', // Yellow
            0.7: 'rgba(255, 100, 0, 0.7)',   // Orange
            1.0: 'rgba(200, 0, 0, 0.8)'      // Red
        }
    });


    // ============================================================
    // LAYER: DRONE SWARM (Jittered Dots for Familiarity)
    // ============================================================
    const swarmLayer = L.layerGroup();

    rawData.forEach(item => {
        // 1. Get Base Coordinates
        let lat = parseFloat(item.geo_responder_settlement_latitude);
        let lng = parseFloat(item.geo_responder_settlement_longitude);

        // 2. Add "Jitter" (Random Noise)
        // This spreads the points out slightly so they don't stack on top of each other.
        // 0.008 degrees is roughly ~800 meters, keeping them within the settlement area.
        const jitterFactor = 0.008; 
        let jLat = lat + (Math.random() - 0.5) * jitterFactor;
        let jLng = lng + (Math.random() - 0.5) * jitterFactor;

        // 3. Determine Color by Familiarity (1-4)
        // We look at the specific text or map the number if you have it
        let color = '#ccc'; // Default Gray (Level 1)
        let fam = parseInt(item.drone_familiarity); // Assuming your SQL maps this to 1,2,3,4

        if (fam === 4) color = '#d73027';      // Red (Expert)
        else if (fam === 3) color = '#fc8d59'; // Orange (Handled)
        else if (fam === 2) color = '#91bfdb'; // Blue (Heard)
        else color = '#e0e0e0';                // Gray (Novice)

        // 4. Create the Tiny Dot
        let dot = L.circleMarker([jLat, jLng], {
            radius: 4,          // Small size
            fillColor: color,
            color: "#000",      // Black border for contrast
            weight: 0.5,        // Thin border
            opacity: 1,
            fillOpacity: 0.9
        });

        // 5. Popup showing specific details for that ONE person
        dot.bindPopup(`
            <strong>Respondent Profile</strong><br>
            Age: ${item.age}<br>
            Gender: ${item.gender}<br>
            Familiarity Level: ${fam}/4<br>
            Postal: ${item.responder_postal_code}
        `);

        swarmLayer.addLayer(dot);
    });





    // ============================================================
    // LAYER: FAMILIARITY PIE CHARTS
    // ============================================================
    // ============================================================
    // LAYER: FAMILIARITY PIE CHARTS (CSS Conic Gradient Method)
    // ============================================================
    
    const pieLayer = L.layerGroup();

    // 1. Define your colors (Novice -> Expert)
    const colors = [
        '#feebe2', // Novice (Level 1)
        '#fbb4b9', // Aware (Level 2)
        '#f768a1', // Handled (Level 3)
        '#7a0177'  // Expert (Level 4)
    ];

    // 2. Iterate and Draw
    Object.values(pieData).forEach(loc => {
        
        // SKIP empty locations to prevent errors/clutter
        if (loc.total === 0) return; 

        // 3. Calculate Percentages for Conic Gradient
        // We need cumulative percentages for the CSS syntax:
        // "Color1 0% 25%, Color2 25% 60%, ..."
        
        let segments = [];
        let currentPercent = 0;

        loc.counts.forEach((count, index) => {
            if (count > 0) {
                let percent = (count / loc.total) * 100;
                let nextPercent = currentPercent + percent;
                
                // Construct the CSS string segment
                // Syntax: "Color start% end%"
                segments.push(`${colors[index]} ${currentPercent.toFixed(1)}% ${nextPercent.toFixed(1)}%`);
                
                currentPercent = nextPercent;
            }
        });

        const cssGradient = `conic-gradient(${segments.join(', ')})`;
        
        // 4. Determine Size (Dynamic)
        // Scale: 20px base + up to 30px more based on volume
        let size = 20 + (Math.sqrt(loc.total) * 8); 

        // 5. Create the Custom Icon
        const pieIcon = L.divIcon({
            className: 'custom-pie-icon', // We can style this class in CSS if needed
            html: `
                <div style="
                    width: ${size}px; 
                    height: ${size}px;
                    background: ${cssGradient};
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.4);
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2] // Center the icon over the coordinate
        });

        // 6. Add Marker to Layer
        const marker = L.marker([loc.lat, loc.lng], { icon: pieIcon });

        // 7. Add Tooltip/Popup
        // Calculate nice percentages for display
        let p = loc.counts.map(c => ((c / loc.total) * 100).toFixed(1));
        
        marker.bindPopup(`
            <div style="text-align:center; min-width: 150px;">
                <strong>${loc.postal}</strong><br>
                <span style="font-size:11px; color:#555;">${loc.total} Respondents</span>
                <hr style="margin:5px 0; border:0; border-top:1px solid #eee;">
                <div style="text-align:left; font-size:12px; line-height:1.4em;">
                    <span style="color:${colors[3]}">■</span> Expert: <b>${loc.counts[3]}</b> (${p[3]}%)<br>
                    <span style="color:${colors[2]}">■</span> Handled: <b>${loc.counts[2]}</b> (${p[2]}%)<br>
                    <span style="color:${colors[1]}">■</span> Heard: <b>${loc.counts[1]}</b> (${p[1]}%)<br>
                    <span style="color:${colors[0]}">■</span> Novice: <b>${loc.counts[0]}</b> (${p[0]}%)
                </div>
            </div>
        `);

        pieLayer.addLayer(marker);
    });


    
    



    // ============================================================
    // 5. CONTROLS & EXPORT
    // ============================================================

    // Layer Controls
    const baseMaps = {
        "Clean Map": CartoDB,
        "Satellite": GoogleSatellite
    };

    const overlayMaps = {
        "Voronoi (Territories)": voronoiLayer,
        "<span style='color:blue'>Heatmap: Less Familiar</span>": heatLess,
        "<span style='color:red'>Heatmap: More Familiar</span>": heatMore
    };
    // Add to your Layer Control
    overlayMaps["Drone Swarm (Individual)"] = swarmLayer;
    overlayMaps["Familiarity (Pie Charts)"] = pieLayer;

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Default View: Show Voronoi + Clean Map
    voronoiLayer.addTo(map);

    // Screenshot Tool
    const screenshoter = L.simpleMapScreenshoter({ hidden: true }).addTo(map);

    // Download Button Logic
    // (You can trigger this via a button in your UI calling screenshoter.takeScreen('blob')...)


    // ============================================================
    // 6. LEGEND
    // ============================================================
    
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.background = "rgba(255,255,255,0.9)";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
        
        div.innerHTML = `
            <div style="font-size:12px; line-height:1.5em;">
                <strong>Voronoi Familiarity</strong><br>
                <i style="background:#006d2c; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> Expert (3.5+)<br>
                <i style="background:#66c2a4; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> Familiar (2.5-3.5)<br>
                <i style="background:#fc8d59; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> Aware (1.5-2.5)<br>
                <i style="background:#d73027; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> Novice (< 1.5)<br>
                <hr style="margin:5px 0; border:0; border-top:1px solid #ccc;">
                <strong>Heatmap Density</strong><br>
                <span style="color:blue">Blue</span> = Less Familiar<br>
                <span style="color:red">Red</span> = More Familiar
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}