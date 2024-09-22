// Function to convert latitude and longitude to MGRS
function latLonToMgrs(lat, lon) {
    try {
        // MGRS.forward expects [lon, lat] and returns an MGRS string
        var mgrsCoord = mgrs.forward([lon, lat], 5); // 5-digit precision
        return mgrsCoord;
    } catch (e) {
        console.error('Error converting lat/lon to MGRS:', e);
        return 'Conversion Error';
    }
}

// Function to get grid interval based on zoom level
function getGridInterval(zoom) {
    if (zoom > 15) return 0.001; // High zoom level
    if (zoom > 12) return 0.005;
    if (zoom > 10) return 0.01;
    if (zoom > 8) return 0.05;
    if (zoom > 6) return 0.1;
    if (zoom > 4) return 0.5;
    return 1; // Low zoom level
}

// Function to draw MGRS grid lines on the map
function drawMgrsGrid() {
    // Clear existing grid lines
    if (window.gridLines) {
        window.gridLines.forEach(function(line) {
            line.setMap(null);
        });
    }
    window.gridLines = [];

    var bounds = map.getBounds();
    var zoom = map.getZoom();
    var interval = getGridInterval(zoom);

    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();

    var latStart = Math.floor(sw.lat() / interval) * interval;
    var latEnd = Math.ceil(ne.lat() / interval) * interval;
    var lngStart = Math.floor(sw.lng() / interval) * interval;
    var lngEnd = Math.ceil(ne.lng() / interval) * interval;

    // Draw horizontal lines
    for (var lat = latStart; lat <= latEnd; lat += interval) {
        var line = new google.maps.Polyline({
            path: [{ lat: lat, lng: lngStart }, { lat: lat, lng: lngEnd }],
            map: map,
            strokeColor: '#000000',
            strokeOpacity: 0.3,
            strokeWeight: 1
        });
        window.gridLines.push(line);
    }

    // Draw vertical lines
    for (var lng = lngStart; lng <= lngEnd; lng += interval) {
        var line = new google.maps.Polyline({
            path: [{ lat: latStart, lng: lng }, { lat: latEnd, lng: lng }],
            map: map,
            strokeColor: '#000000',
            strokeOpacity: 0.3,
            strokeWeight: 1
        });
        window.gridLines.push(line);
    }
}


