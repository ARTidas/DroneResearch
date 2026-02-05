let map;

/**
 * Initializes the Leaflet map and plots the data points as proportional bubbles.
 */
function initializeMap(data) {

    // 1. Setup Map
    let center = [47.165, 19.509]; // Center of Hungary

    // --- FIX FOR SKEWED IMAGE ---
    // Disable 3D CSS transforms. This forces Leaflet to use standard 2D positioning,
    // which the screenshot plugin can capture perfectly without distortion.
    L.Browser.any3d = false;

    // Now create the map
    map = L.map('map_full').setView(center, 7);

    // --- IMPORTANT CHANGE FOR EXPORT ---
    // You MUST add { crossOrigin: true } to the tile layer options.
    // Also, use HTTPS for tiles to avoid mixed-content security errors.

    // 2. Add Base Layers
    let OpenStreetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Note: Google Maps tiles often block programmatic downloading due to CORS policies.
    // If the download fails or the background is blank, switch to the OSM layer before clicking download.
    let GoogleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });

    // 2. Add the Screenshot / Export Control
    // CHANGE: Assign this to a variable instead of just adding it to the map
    const screenshoter = L.simpleMapScreenshoter({
        hidden: true // hides the loading loader
    }).addTo(map);

    // 3. Create a Custom "Download Map" Button
    const downloadControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            
            container.style.backgroundColor = 'white';
            container.style.padding = '5px 10px';
            container.style.cursor = 'pointer';
            container.style.fontWeight = 'bold';
            container.title = "Download Map as Image";
            container.innerHTML = "📷 Save Map";

            container.onclick = function() {
                // CHANGE 'image' TO 'blob' HERE
                screenshoter.takeScreen('blob', { // <--- This was 'image' before
                    mimeType: 'image/png',
                    //caption: 'Thesis Map - Drone Responder Distribution' 
                }).then(blob => {
                    saveAs(blob, 'thesis-map-export.png');
                }).catch(e => {
                    alert("Export Error: " + e.toString());
                });
            }
            return container;
        }
    });
    //map.addControl(new downloadControl());

    // 3. Create Layer Group
    const responderGroup = L.layerGroup().addTo(map);

    // 4. Calculate Max Responders (for scaling)
    // We need to know the biggest number to set the maximum circle size
    let maxCount = 0;
    data.forEach(item => {
        let count = parseInt(item.responders || 1); // Default to 1 if missing
        if (count > maxCount) maxCount = count;
    });

    // --- Helper: Radius Calculator ---
    // Uses square root to keep area proportional to value (standard cartography rule)
    function getRadius(value) {
        // Base size (5px) + Dynamic size
        // Adjust the '15' multiplier to make circles bigger/smaller overall
        return 5 + (Math.sqrt(value) * 5); 
    }

    // --- Helper: Color Calculator (Optional) ---
    // Darker color for higher counts
    function getColor(value) {
        return value > 10 ? '#800026' : // High count = Dark Red
               value > 5  ? '#BD0026' :
               value > 2  ? '#E31A1C' :
               '#3388ff';               // Low count = Blue
    }

    // 5. Loop and Draw
    data.forEach(item => {
        const lat = parseFloat(item.geo_responder_settlement_latitude);
        const lng = parseFloat(item.geo_responder_settlement_longitude);
        const count = parseInt(item.responders || 0);

        if (!isNaN(lat) && !isNaN(lng)) {
            
            // Use circleMarker instead of standard marker
            let circle = L.circleMarker([lat, lng], {
                radius: getRadius(count),
                fillColor: getColor(count),
                color: "#fff",       // White border
                weight: 1,           // Border thickness
                opacity: 1,
                fillOpacity: 0.7     // Slight transparency to show overlapping
            });

            // Popup
            circle.bindPopup(`
                <div style="text-align:center;">
                    <strong>Postal Code: ${item.responder_postal_code}</strong><br/>
                    <span style="font-size:14px; font-weight:bold;">${count} Responders</span><br/>
                    <span style="color:#666; font-size:10px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                </div>
            `);

            responderGroup.addLayer(circle);
        }
    });

    // 6. Add Layer Control
    L.control.layers(
        { 'OpenStreetMap': OpenStreetMap, 'Google Satellite': GoogleSatellite },
        { 'Responders': responderGroup },
        { position: 'topleft' }
    ).addTo(map);
    
    // 7. Add a Legend (Crucial for Thesis)
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        
        // CSS for the Legend Box
        div.style.background = "white";
        div.style.padding = "10px";
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
        div.style.lineHeight = "24px"; // Spacing between lines
        div.style.color = "#555";
        
        div.innerHTML = "<strong>Responders</strong><br>";
        
        // Define specific grades to ensure the legend looks clean
        // We use the maxCount dynamically
        var grades = [1, 5, 10, 20]; 
        if (maxCount > 20) grades.push(maxCount); // Add max only if it's large
        
        // Remove duplicates and sort (just in case)
        grades = [...new Set(grades)].sort((a,b) => a-b);

        for (var i = 0; i < grades.length; i++) {
            let r = getRadius(grades[i]);
            let c = getColor(grades[i]);
            
            // We align the circle and text vertically
            div.innerHTML += 
                `<div style="display:flex; align-items:center; margin-bottom: 4px;">
                    <i style="background:${c}; width:${r*2}px; height:${r*2}px; border-radius:50%; display:inline-block; opacity:0.7; margin-right: 8px;"></i>
                    <span>${grades[i]}</span>
                </div>`;
        }
        return div;
    };
    legend.addTo(map);

    

    // --- Helper Function for Saving Blob (Native) ---
    function saveAs(blob, filename) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}