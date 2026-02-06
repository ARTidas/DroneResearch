let map;

/**
 * Initializes the Leaflet map and plots the settlement data.
 */
function initializeMap(data) {

    // 1. Setup Map
    // Center of Hungary
    let center = [47.165, 19.509]; 

    // --- FIX FOR SKEWED IMAGE ---
    L.Browser.any3d = false;

    // Create the map
    map = L.map('map_full').setView(center, 7);

    // 2. Add Base Layers
    // Using HTTPS and crossOrigin for screenshot compatibility
    let OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true
    }).addTo(map);

    let GoogleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        crossOrigin: true 
    });

    // 3. Add the Screenshot / Export Control
    const screenshoter = L.simpleMapScreenshoter({
        hidden: true 
    }).addTo(map);

    // 4. Create Custom "Download" Button
    /*const downloadControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            
            // Style the button
            Object.assign(container.style, {
                backgroundColor: 'white',
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
            });
            
            container.title = "Download Map as Image";
            container.innerHTML = "📷 Save Map";

            container.onclick = function() {
                screenshoter.takeScreen('blob', {
                    mimeType: 'image/png'
                }).then(blob => {
                    saveAs(blob, 'hungary-settlement-map.png');
                }).catch(e => {
                    alert("Export Error: " + e.toString());
                });
            }
            return container;
        }
    });
    map.addControl(new downloadControl());*/

    // 5. Create Layer Group
    const settlementGroup = L.layerGroup().addTo(map);

    // 6. Calculate Max Population (for scaling verification if needed)
    let maxPop = 0;
    data.forEach(item => {
        let p = parseInt(item.population || 0);
        if (p > maxPop) maxPop = p;
    });

    // --- Helper: Radius Calculator for Population ---
    // Population numbers are large (e.g. 5000), so we use a smaller multiplier
    // compared to the previous script.
    function getRadius(value) {
        // Example: Pop 2000 -> Sqrt(2000)≈44 -> *0.2 ≈ 9px radius
        // Example: Pop 10000 -> Sqrt(10000)=100 -> *0.2 = 20px radius
        // Base size 3px ensures tiny villages are still visible
        // return 3 + (Math.sqrt(value) * 0.2);
        return 3 + (Math.sqrt(value) * 0.01);
    }

    // --- Helper: Color Calculator ---
    // Based on typical settlement sizes
    function getColor(value) {
        return value > 50000 ? '#800026' : // Major City (Dark Red)
               value > 10000 ? '#BD0026' : // Town
               value > 5000  ? '#E31A1C' : // Large Village
               value > 1000  ? '#FC4E2A' : // Village
               '#FD8D3C';                  // Small Settlement (Orange)
    }

    // 7. Loop and Draw
    data.forEach(item => {
        // Map SQL columns to JS variables
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        const pop = parseInt(item.population || 0);
        const pCode = item.postal_code || '';
        const type = item.type || 'Unknown';

        if (!isNaN(lat) && !isNaN(lng)) {
            
            let circle = L.circleMarker([lat, lng], {
                radius: getRadius(pop),
                fillColor: getColor(pop),
                color: "#333",       // Darker border for better visibility
                weight: 0.5,         // Thinner border
                opacity: 1,
                fillOpacity: 0.8
            });

            // Popup with clean formatting
            circle.bindPopup(`
                <div style="text-align:center; min-width: 100px;">
                    <strong style="font-size:14px; color:#333;">${pCode}</strong><br/>
                    <div style="margin: 4px 0; border-top:1px solid #eee; border-bottom:1px solid #eee; padding: 4px 0;">
                        <strong>${pop.toLocaleString()}</strong> residents
                    </div>
                    <span style="font-size:11px; color:#666;">${type}</span>
                </div>
            `);

            settlementGroup.addLayer(circle);
        }
    });

    // 8. Add Layer Control
    L.control.layers(
        { 'OpenStreetMap': OpenStreetMap, 'Google Satellite': GoogleSatellite },
        { 'Settlements': settlementGroup },
        { position: 'topleft' }
    ).addTo(map);
    
    // 9. Add Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        
        // CSS for Legend
        Object.assign(div.style, {
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
            color: "#555",
            fontSize: "12px",
            lineHeight: "18px"
        });

        div.innerHTML = "<strong style='font-size:13px;'>Population</strong><br><hr style='margin:5px 0; border:0; border-top:1px solid #ddd;'>";
        
        // Define representative grades
        const grades = [500, 2000, 10000, 50000];
        const labels = ["< 1k", "2k", "10k", "> 50k"];

        for (var i = 0; i < grades.length; i++) {
            let val = grades[i];
            let r = getRadius(val);
            let c = getColor(val);
            
            // Draw circle icon next to text
            div.innerHTML += 
                `<div style="display:flex; align-items:center; margin-bottom: 5px;">
                    <i style="background:${c}; width:${r*2}px; height:${r*2}px; border-radius:50%; display:inline-block; opacity:0.8; margin-right: 8px; border:1px solid #333;"></i>
                    <span>${labels[i] || val}</span>
                </div>`;
        }
        return div;
    };
    legend.addTo(map);

    // --- Helper: Save Blob ---
    function saveAs(blob, filename) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}