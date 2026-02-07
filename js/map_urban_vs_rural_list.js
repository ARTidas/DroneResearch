let map;

function initializeMap(data) {

    // 1. Setup Map
    // Center of Hungary, slightly zoomed out to see the whole country
    let center = [47.1625, 19.5033]; 

    L.Browser.any3d = false; // Fix for screenshot distortion

    map = L.map('map_full').setView(center, 7);

    // 2. Base Layers
    // Using a cleaner base map (CartoDB Light) makes the data colors pop more than standard OSM
    let CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    let GoogleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });

    // 3. Create Layer Groups (This is key for your analysis)
    const urbanGroup = L.layerGroup();
    const ruralGroup = L.layerGroup();

    // 4. Style Definitions
    const styles = {
        'Urban': { color: '#d95f02', fillColor: '#d95f02' }, // Burnt Orange
        'Rural': { color: '#1b9e77', fillColor: '#1b9e77' }  // Emerald Green
    };

    // --- Helper: Radius Calculator ---
    // We use Square Root to make the *Area* of the circle proportional to population.
    // Factor 0.08 keeps Budapest from covering the whole map while keeping villages visible.
    function getRadius(pop) {
        let r = Math.sqrt(pop) * 0.08;
        return Math.max(r, 2); // Minimum 2px so tiny hamlets are visible
    }

    // 5. Draw Bubbles
    data.forEach(item => {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        const pop = parseInt(item.population || 0);
        const cat = item.category || 'Rural'; // Default fallback

        if (!isNaN(lat) && !isNaN(lng)) {
            
            let style = styles[cat] || styles['Rural'];

            let circle = L.circleMarker([lat, lng], {
                radius: getRadius(pop),
                fillColor: style.fillColor,
                color: style.color, 
                weight: 1,           // Thin border
                opacity: 0.8,
                fillOpacity: 0.6     // Transparency allows seeing overlapping agglomerations
            });

            // Clean Popup
            circle.bindPopup(`
                <div style="min-width:120px; text-align:center;">
                    <strong style="font-size:14px;">${item.settlement_name}</strong>
                    <br><span style="color:#666; font-size:11px;">${item.postal_code}</span>
                    <hr style="margin:5px 0; border:0; border-top:1px solid #eee;">
                    <strong style="color:${style.color}">${cat}</strong>
                    <br>${pop.toLocaleString()} residents
                </div>
            `);

            // Add to the correct group
            if (cat === 'Urban') {
                urbanGroup.addLayer(circle);
            } else {
                ruralGroup.addLayer(circle);
            }
        }
    });

    // 6. Add Layers to Map
    urbanGroup.addTo(map);
    ruralGroup.addTo(map);

    // 7. Layer Controls (The Toggle Switch)
    const overlayMaps = {
        "<span style='color:#d95f02; font-weight:bold'>Urban</span> (Cities)": urbanGroup,
        "<span style='color:#1b9e77; font-weight:bold'>Rural</span> (Villages)": ruralGroup
    };

    const baseMaps = {
        "Clean Map": CartoDB,
        "Satellite": GoogleSatellite
    };

    L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);

    // 8. Add Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        Object.assign(div.style, {
            background: "white", padding: "10px", border: "2px solid rgba(0,0,0,0.2)", borderRadius: "5px"
        });

        div.innerHTML = `
            <strong>Settlement Status</strong><br>
            <div style="margin-top:5px;">
                <i style="background:#d95f02; width:12px; height:12px; display:inline-block; border-radius:50%;"></i> Urban<br>
                <i style="background:#1b9e77; width:12px; height:12px; display:inline-block; border-radius:50%;"></i> Rural
            </div>
            <div style="margin-top:10px; font-size:11px; color:#555;">
                Size represents Population
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}