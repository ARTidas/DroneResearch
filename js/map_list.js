// Global variable to hold the map instance, in case other functions need it later
let map;

/**
 * Initializes the Leaflet map and plots the data points.
 * @param {Array<Object>} data - The array of postal code data fetched from PHP.
 */
function initializeMap(data) {

    // Marker color image source: https://github.com/pointhi/leaflet-color-markers/tree/master/img
    // Define a custom icon (e.g., blue) for the new data points
    var blueIcon = new L.Icon({
        iconUrl: 'cdn/map_images/marker-icon-blue.png',
        shadowUrl: 'cdn/map_images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Setup base variables for the Leaflet map
    let center = [47.165, 19.509]; // Default center (Sárospatak)
    
    // Create the map instance
    map = L.map('map_full').setView(center, 7); // Zoom out a bit (level 7) to see more of Hungary

    let OpenStreetMap = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 18,
            attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);
    // Using a cleaner base map (CartoDB Light) makes the data colors pop more than standard OSM
    let CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Create a Layer Group for the new responder markers
    const responderGroup = L.layerGroup().addTo(map);

    // Add controls for the Leaflet map to manage layers
    L.control.layers(
        {
            'OSM': OpenStreetMap,
            "Clean Map": CartoDB,
            'Google': L.tileLayer(
                'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
                {
                    attribution: 'Google'
                }
            )
        },
        {
            'Responders by Postal Code': responderGroup, // Add your new layer group here
        },
        {
            position: 'topleft',
            collapsed: false
        }
    ).addTo(map);
    
    // --- 🎯 Process the Data Array ---
    
    data.forEach(item => {
        // Ensure latitude and longitude are valid numbers
        const lat = parseFloat(item.geo_responder_settlement_latitude);
        const lng = parseFloat(item.geo_responder_settlement_longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            let responder_marker = L.marker(
                [lat, lng],
                {icon: blueIcon} // <-- Now uses the defined blue icon
            );
            
            // Create a popup with the aggregated data
            responder_marker.bindPopup(`
                <strong>Postal Code: ${item.responder_postal_code}</strong><br/>
                Total Responders: <strong>${item.responders}</strong><br/>
                Location: ${lat}, ${lng}
            `);
            
            // Add the marker to the responder layer group
            responderGroup.addLayer(responder_marker);
        } else {
            console.warn(`Skipping invalid coordinates for postal code ${item.responder_postal_code}: Lat=${item.geo_responder_settlement_latitude}, Lng=${item.geo_responder_settlement_longitude}`);
        }
    });
    
    // --- End of Data Processing ---
    
    // Optional: Zoom the map to fit all markers if the group is not empty
    /*if (responderGroup.getLayers().length > 0) {
        map.fitBounds(responderGroup.getBounds());
    }*/

}

// Your existing utility functions remain here
function getRandomCoordinateOffset() {
    return getRandomArbitrary(-0.0001, 0.0001);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}