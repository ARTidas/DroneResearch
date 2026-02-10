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
    
    // C. Aggregate Data for Pie Charts (Counts per level)
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
    const moreFamiliarData = rawData.filter(i => i.drone_familiarity_group === 'More');
    const lessFamiliarData = rawData.filter(i => i.drone_familiarity_group === 'Less');


    // ============================================================
    // 2. MAP SETUP
    // ============================================================
    
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
    // 3. LAYER: VORONOI DIAGRAM (Fixed Geographic Bounds)
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

        // 2. Generate Voronoi with Fixed Bounds
        // ---------------------------------------------------------
        // Instead of using map.getSize() (screen size), we calculate
        // the pixel coordinates of your specific geographic bounding box.
        
        let minLat = 34;
        let minLng = -13;
        let maxLat = 75;
        let maxLng = 64;

        // Convert the geographic corners to pixel coordinates for the current zoom level
        const p1 = map.latLngToLayerPoint([maxLat, minLng]); // North-West
        const p2 = map.latLngToLayerPoint([minLat, maxLng]); // South-East

        // Determine the drawing box (x0, y0, x1, y1)
        const x0 = Math.min(p1.x, p2.x);
        const y0 = Math.min(p1.y, p2.y);
        const x1 = Math.max(p1.x, p2.x);
        const y1 = Math.max(p1.y, p2.y);
        // ---------------------------------------------------------

        const delaunay = d3.Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([x0, y0, x1, y1]);

        // 3. Draw Polygons
        for (let i = 0; i < points.length; i++) {
            const cellPoly = voronoi.cellPolygon(i);
            
            if (cellPoly) {
                const latLngs = cellPoly.map(p => map.layerPointToLatLng([p[0], p[1]]));
                const score = points[i].data.avgFamiliarity;

                let color;
                if (score >= 3.5) color = '#006d2c';      
                else if (score >= 2.5) color = '#66c2a4'; 
                else if (score >= 1.5) color = '#fc8d59'; 
                else color = '#d73027';                   

                const poly = L.polygon(latLngs, {
                    fillColor: color,
                    weight: 1,
                    color: 'white',
                    opacity: 0.3,
                    fillOpacity: 0.45
                });

                poly.bindTooltip(`
                    <b>Postal: ${points[i].data.postal_code}</b><br>
                    Avg Score: ${score.toFixed(2)}<br>
                    Based on ${points[i].data.responderCount} responses
                `, { sticky: true });
                
                voronoiLayer.addLayer(poly);
            }
        }
    }

    // Initial Draw
    drawVoronoi();
    
    // IMPORTANT: We only redraw on ZOOM.
    // We do NOT redraw on 'moveend' (panning) because the diagram 
    // is now drawn for the whole continent, so dragging works automatically.
    map.on('zoomend', drawVoronoi); 


    // ============================================================
    // 4. LAYER: HEATMAPS
    // ============================================================

    const toHeatPoints = (dataset) => dataset.map(d => [
        parseFloat(d.geo_responder_settlement_latitude),
        parseFloat(d.geo_responder_settlement_longitude),
        1.0 
    ]);

    const heatLess = L.heatLayer(toHeatPoints(lessFamiliarData), {
        radius: 35, blur: 25, minOpacity: 0.2,
        gradient: { 0.4: 'rgba(200, 200, 255, 0.4)', 0.7: 'rgba(100, 100, 255, 0.6)', 1.0: 'rgba(0, 0, 255, 0.7)' }
    });

    const heatMore = L.heatLayer(toHeatPoints(moreFamiliarData), {
        radius: 25, blur: 15, minOpacity: 0.2,
        gradient: { 0.4: 'rgba(255, 200, 100, 0.5)', 0.7: 'rgba(255, 100, 0, 0.7)', 1.0: 'rgba(200, 0, 0, 0.8)' }
    });


    // ============================================================
    // LAYER: DRONE SWARM
    // ============================================================
    const swarmLayer = L.layerGroup();

    rawData.forEach(item => {
        let lat = parseFloat(item.geo_responder_settlement_latitude);
        let lng = parseFloat(item.geo_responder_settlement_longitude);

        const jitterFactor = 0.008; 
        let jLat = lat + (Math.random() - 0.5) * jitterFactor;
        let jLng = lng + (Math.random() - 0.5) * jitterFactor;

        let color = '#ccc'; 
        let fam = parseInt(item.drone_familiarity); 

        if (fam === 4) color = '#d73027';      
        else if (fam === 3) color = '#fc8d59'; 
        else if (fam === 2) color = '#91bfdb'; 
        else color = '#e0e0e0';                

        let dot = L.circleMarker([jLat, jLng], {
            radius: 4, fillColor: color, color: "#000", weight: 0.5, opacity: 1, fillOpacity: 0.9
        });

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
    // LAYER: FAMILIARITY PIE CHARTS (CSS Conic Gradient)
    // ============================================================
    
    const pieLayer = L.layerGroup();
    const colors = ['#feebe2', '#fbb4b9', '#f768a1', '#7a0177'];

    Object.values(pieData).forEach(loc => {
        if (loc.total === 0) return; 

        let segments = [];
        let currentPercent = 0;

        loc.counts.forEach((count, index) => {
            if (count > 0) {
                let percent = (count / loc.total) * 100;
                let nextPercent = currentPercent + percent;
                segments.push(`${colors[index]} ${currentPercent.toFixed(1)}% ${nextPercent.toFixed(1)}%`);
                currentPercent = nextPercent;
            }
        });

        const cssGradient = `conic-gradient(${segments.join(', ')})`;
        let size = 20 + (Math.sqrt(loc.total) * 8); 

        const pieIcon = L.divIcon({
            className: 'custom-pie-icon', 
            html: `
                <div style="
                    width: ${size}px; height: ${size}px;
                    background: ${cssGradient};
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.4);
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2] 
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: pieIcon });
        
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

    const baseMaps = {
        "Clean Map": CartoDB,
        "Satellite": GoogleSatellite
    };

    const overlayMaps = {
        "Voronoi (Territories)": voronoiLayer,
        "<span style='color:blue'>Heatmap: Less Familiar</span>": heatLess,
        "<span style='color:red'>Heatmap: More Familiar</span>": heatMore,
        "Drone Swarm (Individual)": swarmLayer,
        "Familiarity (Pie Charts)": pieLayer
    };

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    voronoiLayer.addTo(map);
    const screenshoter = L.simpleMapScreenshoter({ hidden: true }).addTo(map);


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