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

// Function to get grid interval based on zoom level - more granular control
function getGridInterval(zoom) {
    if (zoom >= 18) return 0.0001; // 10m grid at very high zoom
    if (zoom >= 16) return 0.0005; // 50m grid
    if (zoom >= 14) return 0.001;  // 100m grid
    if (zoom >= 12) return 0.01;   // 1km grid
    if (zoom >= 10) return 0.1;    // 10km grid
    if (zoom >= 8) return 0.5;     // 50km grid
    if (zoom >= 6) return 1;       // 100km grid
    return 5;                      // 500km grid at low zoom
}

// Function to draw MGRS grid lines with labels
function drawMgrsGrid() {
    // Clear existing grid lines and labels
    if (window.gridLines) {
        window.gridLines.forEach(function(line) {
            line.setMap(null);
        });
    }
    window.gridLines = [];
    
    if (window.gridLabels) {
        window.gridLabels.forEach(function(label) {
            label.setMap(null);
        });
    }
    window.gridLabels = [];

    // If grid toggle is off, don't draw grid
    if (document.getElementById('mgrsGridToggle') && !document.getElementById('mgrsGridToggle').checked) {
        return;
    }

    var bounds = map.getBounds();
    var zoom = map.getZoom();
    var interval = getGridInterval(zoom);

    // Skip grid drawing at very low zoom levels
    if (zoom < 5) return;

    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();

    var latStart = Math.floor(sw.lat() / interval) * interval;
    var latEnd = Math.ceil(ne.lat() / interval) * interval;
    var lngStart = Math.floor(sw.lng() / interval) * interval;
    var lngEnd = Math.ceil(ne.lng() / interval) * interval;

    // Draw horizontal lines with MGRS northing labels
    for (var lat = latStart; lat <= latEnd; lat += interval) {
        var line = new google.maps.Polyline({
            path: [{ lat: lat, lng: lngStart }, { lat: lat, lng: lngEnd }],
            map: map,
            strokeColor: '#444444',
            strokeOpacity: 0.4,
            strokeWeight: 1
        });
        window.gridLines.push(line);
        
        // Add label at the left edge of the map
        if (zoom >= 10) {  // Only show labels at sufficient zoom
            var labelPos = new google.maps.LatLng(lat, bounds.getSouthWest().lng());
            var mgrsCoord = mgrs.forward([labelPos.lng(), labelPos.lat()], 5);
            var northing = mgrsCoord.substring(mgrsCoord.length - 5); // Last 5 digits are northing
            
            var label = new google.maps.Marker({
                position: labelPos,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0,  // Size 0 to make the marker invisible
                },
                label: {
                    text: northing,
                    color: "#444444",
                    fontSize: "10px",
                    fontWeight: "bold"
                }
            });
            window.gridLabels.push(label);
        }
    }

    // Draw vertical lines with MGRS easting labels
    for (var lng = lngStart; lng <= lngEnd; lng += interval) {
        var line = new google.maps.Polyline({
            path: [{ lat: latStart, lng: lng }, { lat: latEnd, lng: lng }],
            map: map,
            strokeColor: '#444444',
            strokeOpacity: 0.4,
            strokeWeight: 1
        });
        window.gridLines.push(line);
        
        // Add label at the bottom edge of the map
        if (zoom >= 10) {  // Only show labels at sufficient zoom
            var labelPos = new google.maps.LatLng(bounds.getSouthWest().lat(), lng);
            var mgrsCoord = mgrs.forward([labelPos.lng(), labelPos.lat()], 5);
            var easting = mgrsCoord.substring(mgrsCoord.length - 10, mgrsCoord.length - 5); // 5 digits before northing
            
            var label = new google.maps.Marker({
                position: labelPos,
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0,  // Size 0 to make the marker invisible
                },
                label: {
                    text: easting,
                    color: "#444444",
                    fontSize: "10px",
                    fontWeight: "bold"
                }
            });
            window.gridLabels.push(label);
        }
    }
    
    // Add MGRS zone labels at appropriate zoom levels
    if (zoom <= 9) {
        // Calculate center position for the zone label
        var centerLat = (latStart + latEnd) / 2;
        var centerLng = (lngStart + lngEnd) / 2;
        var centerPos = new google.maps.LatLng(centerLat, centerLng);
        var mgrsCoord = mgrs.forward([centerPos.lng(), centerPos.lat()], 5);
        
        // Extract zone number and letter (first part of MGRS)
        var zoneDesignator = mgrsCoord.split(' ')[0]; // This might need adjustment based on actual output format
        if (!zoneDesignator) {
            zoneDesignator = mgrsCoord.match(/^\d+[A-Z]/)[0]; // Regex to extract zone number + letter
        }
        
        // Add zone label
        var zoneLabel = new google.maps.Marker({
            position: centerPos,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0
            },
            label: {
                text: "Zone " + zoneDesignator,
                color: "#000000",
                fontSize: "14px",
                fontWeight: "bold"
            }
        });
        window.gridLabels.push(zoneLabel);
    }
}

// Function to get MGRS 100k grid square (the two-letter part)
function getMgrsGridSquare(mgrsString) {
    // Assuming MGRS format like "15S UT 1234 5678"
    // Extract the two-letter grid designator (here, "UT")
    const parts = mgrsString.split(' ');
    if (parts.length >= 2) {
        return parts[1];
    }
    
    // For MGRS without spaces (e.g., "15SUT12345678")
    // Extract the two letters after the zone designator
    const match = mgrsString.match(/^\d+[A-Z]([A-Z]{2})/);
    if (match && match[1]) {
        return match[1];
    }
    
    return '';
}

// Function to highlight the current MGRS grid square
function highlightCurrentGridSquare(mgrsString) {
    // Clear previous highlight
    if (window.currentGridSquare) {
        window.currentGridSquare.setMap(null);
    }
    
    // Get the full grid reference
    const parsed = parseMgrsString(mgrsString);
    if (!parsed) return;
    
    // Convert corners to lat/lng
    const sw = mgrs.toPoint(`${parsed.zone}${parsed.square}00000000`);
    const ne = mgrs.toPoint(`${parsed.zone}${parsed.square}9999`);
    
    // Create a rectangle for the grid square
    window.currentGridSquare = new google.maps.Rectangle({
        bounds: {
            north: ne[1],
            south: sw[1],
            east: ne[0],
            west: sw[0]
        },
        map: map,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.1
    });
}

// Helper function to parse MGRS string into components
function parseMgrsString(mgrsString) {
    // Try with spaces first (e.g., "15S UT 1234 5678")
    let parts = mgrsString.split(' ');
    if (parts.length >= 2) {
        return {
            zone: parts[0],
            square: parts[1],
            easting: parts.length > 2 ? parts[2] : '',
            northing: parts.length > 3 ? parts[3] : ''
        };
    }
    
    // Without spaces (e.g., "15SUT12345678")
    const match = mgrsString.match(/^(\d+[A-Z])([A-Z]{2})(\d{0,5})(\d{0,5})$/);
    if (match) {
        return {
            zone: match[1],
            square: match[2],
            easting: match[3],
            northing: match[4]
        };
    }
    
    return null;
}

// Function to go to an MGRS coordinate
function goToMgrs(mgrsString) {
    try {
        // Convert MGRS to lat/lon using the mgrs library
        const latLon = mgrs.toPoint(mgrsString);
        if (latLon && latLon.length === 2) {
            // Focus the map on this location
            map.setCenter({lat: latLon[1], lng: latLon[0]});
            
            // Add a marker at the location
            const marker = new google.maps.Marker({
                position: {lat: latLon[1], lng: latLon[0]},
                map: map,
                title: mgrsString,
                animation: google.maps.Animation.DROP
            });
            
            // Optional: Show info window with MGRS coordinate
            const infoWindow = new google.maps.InfoWindow({
                content: `MGRS: ${mgrsString}`
            });
            infoWindow.open(map, marker);
            
            // Highlight the grid square if applicable
            const gridSquare = getMgrsGridSquare(mgrsString);
            if (gridSquare) {
                highlightCurrentGridSquare(mgrsString);
            }
            
            return marker;
        }
    } catch (error) {
        console.error('Error going to MGRS coordinate:', error);
        alert('Invalid MGRS coordinate format. Please check and try again.');
    }
    return null;
}

// Enhanced coordinate display function
let mgrsDisplayPrecision = 5; // Default to 1m precision

function updateCoordinateDisplay(latLng) {
    var lat = latLng.lat();
    var lng = latLng.lng();

    // Convert Lat/Lon to MGRS with appropriate precision
    var mgrsCoord = mgrs.forward([lng, lat], mgrsDisplayPrecision);
    
    // Format MGRS for display with better spacing
    var formattedMgrs = formatMgrsForDisplay(mgrsCoord);

    // Update the display
    document.getElementById('coordinateDisplay').innerHTML =
        'Lat/Lon: ' + lat.toFixed(6) + ', ' + lng.toFixed(6) + '<br>' +
        'MGRS: <span class="mgrs-highlight">' + formattedMgrs + '</span>';
}

// Helper function to format MGRS string with proper spacing
function formatMgrsForDisplay(mgrsString) {
    // Format depends on the string format returned by the mgrs library
    // Adjust as needed based on actual output
    
    // For MGRS like "15SUT12345678"
    // Convert to "15S UT 1234 5678" for better readability
    
    // Extract grid zone designator (number + letter)
    const gzd = mgrsString.match(/^\d+[A-Z]/)[0];
    
    // Extract square identifier (two letters)
    const square = mgrsString.substring(gzd.length, gzd.length + 2);
    
    // Extract easting and northing
    const remaining = mgrsString.substring(gzd.length + 2);
    const halfLength = remaining.length / 2;
    const easting = remaining.substring(0, halfLength);
    const northing = remaining.substring(halfLength);
    
    // Return formatted string
    return `${gzd} ${square} ${easting} ${northing}`;
}


