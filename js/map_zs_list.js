let map;

/**
 * Initializes the Leaflet map and plots the data points as proportional bubbles.
 */
function initializeMap(data) {

    // 1. Setup Map
    // Mivel a Zempléni adatok egy kis helyen vannak, a 'center' csak alapértelmezés,
    // a kód végén lévő fitBounds fogja majd pontosan beállítani a nézetet.
    let center = [47.165, 19.509]; 

    // --- FIX FOR SKEWED IMAGE ---
    L.Browser.any3d = false;

    map = L.map('map_full').setView(center, 7);

    // 2. Add Base Layers
    let OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
        crossOrigin: true // Fontos az exportáláshoz
    }).addTo(map);

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

    // 3. Add the Screenshot / Export Control
    /*const screenshoter = L.simpleMapScreenshoter({
        hidden: true 
    }).addTo(map);*/

    // Custom Download Button logic (unchanged structure, just kept for context)
    /*const downloadControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = 'white';
            container.style.padding = '5px 10px';
            container.style.cursor = 'pointer';
            container.style.fontWeight = 'bold';
            container.title = "Térkép mentése képként";
            container.innerHTML = "📷 Mentés";

            container.onclick = function() {
                screenshoter.takeScreen('blob', {
                    mimeType: 'image/png'
                }).then(blob => {
                    saveAs(blob, 'kikuldesek-terkep.png');
                }).catch(e => {
                    alert("Export Error: " + e.toString());
                });
            }
            return container;
        }
    });
    map.addControl(new downloadControl());*/ // Gomb hozzáadása

    // 4. Create Layer Group
    const responderGroup = L.layerGroup().addTo(map);

    // 5. Calculate Max Count (for scaling)
    let maxCount = 0;
    data.forEach(item => {
        // SQL ALIAS: `send_count`
        let count = parseInt(item.send_count || 0); // <--- FRISSÍTVE
        if (count > maxCount) maxCount = count;
    });

    // --- Helper: Radius Calculator ---
    function getRadius(value) {
        // Mivel a számok kicsik (5-25), kicsit növeltem a szorzót (8-ra), hogy látványosabb legyen
        if (value === 0) return 0;
        return 6 + (Math.sqrt(value) * 8); 
    }

    // --- Helper: Color Calculator ---
    function getColor(value) {
        return value > 20 ? '#800026' : // 20 felett (Sárospatak)
               value > 15 ? '#BD0026' : // 15 felett (Tolcsva)
               value > 10 ? '#E31A1C' : // 10 felett
               value > 5  ? '#FC4E2A' : // 5 felett
               '#FD8D3C';               // Kisebb számok
    }

    // 6. Loop and Draw
    data.forEach(item => {
        // SQL ALIASOK HASZNÁLATA:
        const lat = parseFloat(item.latitude);       // <--- FRISSÍTVE
        const lng = parseFloat(item.longitude);      // <--- FRISSÍTVE
        const count = parseInt(item.send_count || 0);// <--- FRISSÍTVE
        const city = item.city_name;                 // <--- ÚJ ADAT
        const zip = item.postal_code;                // <--- FRISSÍTVE

        if (!isNaN(lat) && !isNaN(lng)) {
            
            let circle = L.circleMarker([lat, lng], {
                radius: getRadius(count),
                fillColor: getColor(count),
                color: "#fff",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });

            // Popup frissítése magyarra és az új adatokkal
            circle.bindPopup(`
                <div style="text-align:center; min-width: 120px;">
                    <strong style="font-size:14px;">${city}</strong><br/>
                    <span style="color:#666;">Irsz: ${zip}</span><br/>
                    <hr style="margin:5px 0; border:0; border-top:1px solid #ccc;">
                    <span style="font-size:16px; font-weight:bold; color:#BD0026;">${count} db</span><br/>
                    <span style="font-size:11px;">kiküldés</span>
                </div>
            `);

            responderGroup.addLayer(circle);
        }
    });

    // 7. Add Layer Control
    L.control.layers(
        { 'OpenStreetMap': OpenStreetMap, "Clean Map": CartoDB, 'Google Satellite': GoogleSatellite },
        { 'Kiküldések': responderGroup },
        { position: 'topleft' }
    ).addTo(map);
    
    // 8. Add Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        
        div.style.background = "white";
        div.style.padding = "10px";
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
        div.style.lineHeight = "24px";
        div.style.color = "#555";
        
        div.innerHTML = "<strong>Kiküldések száma</strong><br>";
        
        // Dinamikus skála a max érték alapján
        var grades = [5, 10, 15, 20]; 
        if (maxCount > 20) grades.push(maxCount);
        
        grades = [...new Set(grades)].sort((a,b) => a-b);

        for (var i = 0; i < grades.length; i++) {
            let r = getRadius(grades[i]);
            let c = getColor(grades[i]);
            
            // Körök vizuális igazítása
            // Margin-left a kör méretétől függ, hogy középre rendezettnek tűnjön
            div.innerHTML += 
                `<div style="display:flex; align-items:center; margin-bottom: 4px;">
                    <i style="background:${c}; width:${r*2}px; height:${r*2}px; border-radius:50%; display:inline-block; opacity:0.8; margin-right: 10px; border:1px solid #fff;"></i>
                    <span>${grades[i] === maxCount ? grades[i] : '> ' + grades[i]}</span>
                </div>`;
        }
        return div;
    };
    legend.addTo(map);

    // 9. AUTOMATIKUS ZOOM (Nagyon hasznos!)
    // Mivel csak Borsod/Zemplén adataid vannak, ez rázoomol a pontokra,
    // így nem kell kézzel keresgélni őket a térképen.
    if (responderGroup.getLayers().length > 0) {
        map.fitBounds(responderGroup.getBounds(), { padding: [50, 50] });
    }

    // Save helper
    function saveAs(blob, filename) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}