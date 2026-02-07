let map;

/**
 * Visualizes Postal Codes as Bubbles based on Street Density.
 * @param {Array} data - Array of objects {postal_code, settlement_name, latitude, longitude, record_count}
 */
function initializeMap(data) {

    // 1. Setup Map (Center of Hungary)
    let center = [47.165, 19.509]; 

    // Fix for clean screenshots
    L.Browser.any3d = false;

    map = L.map('map_full').setView(center, 7);

    // 2. Base Layers
    let OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true
    }).addTo(map);

    let GoogleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });

    // 3. Screenshot Tool
    const screenshoter = L.simpleMapScreenshoter({ hidden: true }).addTo(map);

    // 4. Download Button
    /*const downloadControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            Object.assign(container.style, {
                backgroundColor: 'white', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold'
            });
            container.innerHTML = "📷 Save Map";
            container.onclick = function() {
                screenshoter.takeScreen('blob', { mimeType: 'image/png' })
                    .then(blob => saveAs(blob, 'postal-code-map.png'))
                    .catch(e => alert("Error: " + e));
            }
            return container;
        }
    });
    map.addControl(new downloadControl());*/

    // 5. Layer Group
    const zipGroup = L.layerGroup().addTo(map);

    // 6. Calculate Max Density (for scaling)
    let maxCount = 0;
    data.forEach(item => {
        let c = parseInt(item.record_count || 1);
        if (c > maxCount) maxCount = c;
    });

    // --- Helper: Radius (Logarithmic scale works better for density) ---
    function getRadius(value) {
        // Base 3px + Log scale. 
        // 1 street -> ~3px
        // 100 streets -> ~10px
        // 500 streets -> ~15px
        return 3 + (Math.log(value + 1) * 2.5); 
    }

    // --- Helper: Color (Blue -> Yellow -> Red) ---
    function getColor(value) {
        return value > 200 ? '#800026' : // Very Dense (City Center)
               value > 100 ? '#BD0026' : 
               value > 50  ? '#E31A1C' : 
               value > 20  ? '#FC4E2A' : 
               value > 5   ? '#FD8D3C' : 
               '#3388ff';                // Sparse (Village/Rural)
    }

    // 7. Draw Bubbles
    data.forEach(item => {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        const count = parseInt(item.record_count || 0);

        if (!isNaN(lat) && !isNaN(lng)) {
            let circle = L.circleMarker([lat, lng], {
                radius: getRadius(count),
                fillColor: getColor(count),
                color: "#333",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.75
            });

            // Clean Popup
            circle.bindPopup(`
                <div style="text-align:center;">
                    <strong style="font-size:14px; color:#000;">${item.postal_code}</strong><br/>
                    <span style="color:#555;">${item.settlement_name}</span><br/>
                    <hr style="margin:4px 0; border:0; border-top:1px solid #ccc;">
                    <strong>${count}</strong> streets/segments
                </div>
            `);

            zipGroup.addLayer(circle);
        }
    });

    // 8. Controls & Legend
    L.control.layers(
        { 'OpenStreetMap': OpenStreetMap, 'Google Satellite': GoogleSatellite },
        { 'Postal Codes': zipGroup },
        { position: 'topleft' }
    ).addTo(map);

    // Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        Object.assign(div.style, {
            background: "white", padding: "10px", border: "1px solid #ccc", borderRadius: "5px"
        });

        div.innerHTML = "<strong>Street Density</strong><br><small>(Addresses per Zip)</small><br>";
        
        // Grades for legend
        const grades = [1, 20, 100, 200];
        const labels = ["Rural", "Suburban", "Urban", "Dense City"];

        for (var i = 0; i < grades.length; i++) {
            let val = grades[i];
            let r = getRadius(val);
            let c = getColor(val);
            
            div.innerHTML += 
                `<div style="display:flex; align-items:center; margin-top: 5px;">
                    <i style="background:${c}; width:${r*2}px; height:${r*2}px; border-radius:50%; display:inline-block; opacity:0.8; margin-right: 8px; border:1px solid #333;"></i>
                    <span>${labels[i]}</span>
                </div>`;
        }
        return div;
    };
    legend.addTo(map);

    function saveAs(blob, filename) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}