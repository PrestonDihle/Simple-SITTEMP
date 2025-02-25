// script.js

let map;
let markers = [];
let shapes = [];
let textOverlays = [];
let measureMarkers = [];
let selectedMarkerType = null;
let selectedColor = 'black';
let selectedMarker = null;
let selectedShape = null;
let selectedTextOverlay = null;
let drawingManager;
let measureMode = false;
let measurePolyline = null;
let measureDistanceInfoWindow = null;
let mgrsDisplayPrecision = 5; // Default to 1m precision

function initMap() {
    // Check if markerTypes is loaded
    if (typeof markerTypes === 'undefined') {
        console.error('markerTypes is not defined. Make sure markerTypes.js is loaded correctly.');
        return;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 35.354340, lng: -116.561519 },
        zoom: 12,
        mapTypeId: 'terrain'
    });

    createMarkerButtons();
    document.getElementById('deleteButton').addEventListener('click', deleteSelectedMarker);
    document.getElementById('deleteShapeButton').addEventListener('click', deleteSelectedShape);
    document.getElementById('deleteTextButton').addEventListener('click', deleteSelectedTextOverlay);
    document.getElementById('measureDistanceButton').addEventListener('click', toggleMeasureMode);
    initColorPicker();

    initDrawingManager();

    // Add event listener for adding text
    document.getElementById('addTextButton').addEventListener('click', enableTextMode);

    // Coordinate Display with updated function
    map.addListener('mousemove', function(event) {
        // Save the event for precision selector updates
        document.getElementById('map').lastMouseMoveEvent = event;
        updateCoordinateDisplay(event.latLng);
    });

    // Grid Lines
    map.addListener('zoom_changed', drawMgrsGrid);
    map.addListener('dragend', drawMgrsGrid);
    google.maps.event.addListenerOnce(map, 'idle', drawMgrsGrid);

    // Initialize MGRS controls
    initMgrsControls();

    // Initialize clipboard functionality
    initClipboardFunctionality();

    // Add right-click context menu
    addMapContextMenu();
}

function createMarkerButtons() {
    const controlsDiv = document.getElementById('controls');
    for (const [type, svg] of Object.entries(markerTypes)) {
        const button = document.createElement('button');
        button.className = 'icon-button';
        button.innerHTML = svg;
        button.addEventListener('click', () => selectMarkerType(type));
        controlsDiv.appendChild(button);
    }
}

function initColorPicker() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => selectColor(option.dataset.color));
    });
    selectColor('black'); // Set default color
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.color === color);
    });

    // Update drawing manager options with the selected color
    if (drawingManager) {
        drawingManager.setOptions({
            polylineOptions: { strokeColor: selectedColor },
            rectangleOptions: {
                fillColor: selectedColor,
                strokeColor: selectedColor
            },
            circleOptions: {
                fillColor: selectedColor,
                strokeColor: selectedColor
            },
            polygonOptions: {
                fillColor: selectedColor,
                strokeColor: selectedColor
            }
        });
    }
}

function selectMarkerType(type) {
    selectedMarkerType = type;
    updateButtonStyles();
}

function updateButtonStyles() {
    document.querySelectorAll('.icon-button').forEach(button => button.classList.remove('selected'));
    if (selectedMarkerType) {
        const index = Object.keys(markerTypes).indexOf(selectedMarkerType);
        document.querySelectorAll('.icon-button')[index].classList.add('selected');
    }
}

function initDrawingManager() {
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['marker', 'polyline', 'rectangle', 'circle', 'polygon']
        },
        markerOptions: {
            draggable: true
        },
        polylineOptions: {
            strokeColor: selectedColor,
            strokeWeight: 2,
            editable: false
        },
        rectangleOptions: {
            fillColor: selectedColor,
            fillOpacity: 0.5,
            strokeColor: selectedColor,
            strokeWeight: 2,
            editable: false,
            draggable: true
        },
        circleOptions: {
            fillColor: selectedColor,
            fillOpacity: 0.5,
            strokeColor: selectedColor,
            strokeWeight: 2,
            editable: false,
            draggable: true
        },
        polygonOptions: {
            fillColor: selectedColor,
            fillOpacity: 0.5,
            strokeColor: selectedColor,
            strokeWeight: 2,
            editable: false,
            draggable: true
        },
        map: map
    });

    // Disable the default marker icon
    google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {
        if (selectedMarkerType) {
            marker.setMap(null);
            addCustomMarker(marker.getPosition(), selectedMarkerType);
        } else {
            markers.push(marker);
            marker.addListener('click', () => selectMarker(marker));
        }
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        const overlay = event.overlay;
        overlay.type = event.type;
        shapes.push(overlay);
        overlay.addListener('click', () => selectShape(overlay));
        clearSelection();
    });
}

function addCustomMarker(position, type) {
    const svgString = markerTypes[type].replace('currentcolor', selectedColor);
    const svgEncoded = encodeURIComponent(svgString);
    const svgDataUrl = `data:image/svg+xml,${svgEncoded}`;

    const marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        icon: {
            url: svgDataUrl,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        }
    });

    marker.addListener('click', () => selectMarker(marker));
    markers.push(marker);
}

function selectMarker(marker) {
    clearSelection();
    selectedMarker = marker;
    marker.setOptions({
        zIndex: 1000
    });
    document.getElementById('deleteButton').disabled = false;
}

function deleteSelectedMarker() {
    if (selectedMarker) {
        selectedMarker.setMap(null);
        markers = markers.filter(m => m !== selectedMarker);
        selectedMarker = null;
        document.getElementById('deleteButton').disabled = true;
    }
}

function selectShape(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setOptions({ strokeWeight: 5 });
    document.getElementById('deleteShapeButton').disabled = false;
}

function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
        shapes = shapes.filter(s => s !== selectedShape);
        selectedShape = null;
        document.getElementById('deleteShapeButton').disabled = true;
    }
}

function clearSelection() {
    if (selectedMarker) {
        selectedMarker.setOptions({ zIndex: 1 });
        selectedMarker = null;
        document.getElementById('deleteButton').disabled = true;
    }

    if (selectedShape) {
        selectedShape.setOptions({ strokeWeight: 2 });
        selectedShape = null;
        document.getElementById('deleteShapeButton').disabled = true;
    }

    if (selectedTextOverlay) {
        selectedTextOverlay = null;
        document.getElementById('deleteTextButton').disabled = true;
    }

    if (measureMode) {
        toggleMeasureMode();
    }
}

function enableTextMode() {
    drawingManager.setDrawingMode(null); // Disable other drawing modes
    map.addListener('click', addTextBoxOnMap);
}

function addTextBoxOnMap(event) {
    const fontSize = document.getElementById('fontSizeSelector').value;
    const fontStyle = document.getElementById('fontStyleSelector').value;
    const color = selectedColor;

    const content = prompt('Enter text:');
    if (content === null) {
        // User cancelled
        google.maps.event.clearListeners(map, 'click');
        return;
    }

    const textDiv = document.createElement('div');
    textDiv.style.color = color;
    textDiv.style.fontSize = `${fontSize}px`;
    textDiv.style.fontStyle = fontStyle;
    textDiv.style.whiteSpace = 'nowrap';
    textDiv.innerHTML = content;

    // Make the text draggable using a hidden marker
    const marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
        draggable: true,
        opacity: 0, // Hide the marker itself
        visible: true // Hide marker icon
    });

    const overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
        const layer = this.getPanes().overlayMouseTarget;
        layer.appendChild(textDiv);
    };

    overlay.draw = function() {
        const projection = this.getProjection();
        const position = projection.fromLatLngToDivPixel(marker.getPosition());
        textDiv.style.position = 'absolute';
        textDiv.style.left = position.x + 'px';
        textDiv.style.top = position.y + 'px';
    };

    overlay.onRemove = function() {
        textDiv.parentNode.removeChild(textDiv);
    };

    overlay.setMap(map);

    marker.addListener('drag', () => {
        overlay.draw();
    });

    marker.addListener('click', () => selectTextOverlay(marker, overlay));

    textOverlays.push({ marker, overlay });

    // Remove the click listener to prevent adding multiple text boxes
    google.maps.event.clearListeners(map, 'click');
}

function selectTextOverlay(marker, overlay) {
    clearSelection();
    selectedTextOverlay = { marker, overlay };
    document.getElementById('deleteTextButton').disabled = false;
}

function deleteSelectedTextOverlay() {
    if (selectedTextOverlay) {
        selectedTextOverlay.overlay.setMap(null);
        selectedTextOverlay.marker.setMap(null);
        textOverlays = textOverlays.filter(item => item !== selectedTextOverlay);
        selectedTextOverlay = null;
        document.getElementById('deleteTextButton').disabled = true;
    }
}

function toggleMeasureMode() {
    measureMode = !measureMode;
    document.getElementById('measureDistanceButton').classList.toggle('selected', measureMode);

    if (measureMode) {
        // Disable other drawing modes
        drawingManager.setDrawingMode(null);
        // Clear previous measurement
        clearMeasurement();
        // Add click listener to the map
        map.addListener('click', addMeasurePoint);
    } else {
        // Remove click listener
        google.maps.event.clearListeners(map, 'click');
        // Clear measurement
        clearMeasurement();
    }
}

function addMeasurePoint(event) {
    const position = event.latLng;

    // Add marker at the clicked position
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        clickable: false
    });
    measureMarkers.push(marker);

    // If there are at least two markers, draw a polyline
    if (measureMarkers.length > 1) {
        if (measurePolyline) {
            measurePolyline.setMap(null);
        }

        const path = measureMarkers.map(marker => marker.getPosition());
        measurePolyline = new google.maps.Polyline({
            path: path,
            map: map,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            clickable: false
        });

        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            totalDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]);
        }

        // Display distance in an info window
        if (!measureDistanceInfoWindow) {
            measureDistanceInfoWindow = new google.maps.InfoWindow();
        }

        measureDistanceInfoWindow.setContent('Distance: ' + totalDistance.toFixed(2) + ' meters');
        measureDistanceInfoWindow.setPosition(position);
        measureDistanceInfoWindow.open(map);
    }
}

function clearMeasurement() {
    if (measureMarkers.length > 0) {
        measureMarkers.forEach(marker => marker.setMap(null));
        measureMarkers = [];
    }
    if (measurePolyline) {
        measurePolyline.setMap(null);
        measurePolyline = null;
    }
    if (measureDistanceInfoWindow) {
        measureDistanceInfoWindow.close();
    }
}

// New MGRS-related functions
function initMgrsControls() {
    // Add event listener for the MGRS go button
    document.getElementById('mgrsGoButton').addEventListener('click', function() {
        const mgrsCoord = document.getElementById('mgrsInput').value.trim();
        if (mgrsCoord) {
            goToMgrs(mgrsCoord);
        } else {
            alert('Please enter an MGRS coordinate');
        }
    });

    // Add event listener for the enter key in the MGRS input field
    document.getElementById('mgrsInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('mgrsGoButton').click();
        }
    });

    // Add event listener for the grid toggle
    document.getElementById('mgrsGridToggle').addEventListener('change', function() {
        if (this.checked) {
            drawMgrsGrid();
        } else {
            // Clear existing grid lines and labels
            if (window.gridLines) {
                window.gridLines.forEach(function(line) {
                    line.setMap(null);
                });
                window.gridLines = [];
            }
            
            if (window.gridLabels) {
                window.gridLabels.forEach(function(label) {
                    label.setMap(null);
                });
                window.gridLabels = [];
            }
        }
    });

    // Add event listener for the precision selector
    document.getElementById('precisionSelector').addEventListener('change', function() {
        mgrsDisplayPrecision = parseInt(this.value);
        // Update coordinate display if mouse is over map
        const mapDiv = document.getElementById('map');
        const lastEvent = mapDiv.lastMouseMoveEvent;
        if (lastEvent) {
            updateCoordinateDisplay(lastEvent.latLng);
        }
    });
}

// Clipboard functionality
function initClipboardFunctionality() {
    const coordDisplay = document.getElementById('coordinateDisplay');
    
    // Make it visually clear it's clickable
    coordDisplay.style.cursor = 'pointer';
    coordDisplay.title = 'Click to copy coordinates';
    
    coordDisplay.addEventListener('click', function() {
        // Get the current coordinates
        const mgrsText = coordDisplay.querySelector('.mgrs-highlight')?.textContent || 'N/A';
        const latLonText = coordDisplay.textContent.split('\n')[0].replace('Lat/Lon: ', '');
        
        // Prepare text to copy
        const textToCopy = `${latLonText}\nMGRS: ${mgrsText}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Visual feedback
                const originalBackground = coordDisplay.style.backgroundColor;
                coordDisplay.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';  // Green highlight
                
                // Reset after a short delay
                setTimeout(() => {
                    coordDisplay.style.backgroundColor = originalBackground;
                }, 500);
            })
            .catch(err => {
                console.error('Failed to copy coordinates: ', err);
                alert('Failed to copy coordinates to clipboard');
            });
    });
}

// Add right-click context menu for the map to copy MGRS at click point
function addMapContextMenu() {
    google.maps.event.addListener(map, 'rightclick', function(event) {
        // Create a custom context menu
        if (window.contextMenu) {
            window.contextMenu.close();
        }
        
        // Get MGRS at click position
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const mgrsCoord = mgrs.forward([lng, lat], mgrsDisplayPrecision);
        const formattedMgrs = formatMgrsForDisplay(mgrsCoord);
        
        // Create context menu div
        const contextMenuDiv = document.createElement('div');
        contextMenuDiv.className = 'custom-context-menu';
        contextMenuDiv.innerHTML = `
            <div class="context-menu-item" id="copyMgrs">Copy MGRS: ${formattedMgrs}</div>
            <div class="context-menu-item" id="copyLatLng">Copy Lat/Lng: ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
            <div class="context-menu-item" id="placeMarkerHere">Place Marker Here</div>
            <div class="context-menu-item" id="measureFromHere">Measure From Here</div>
        `;
        
        // Position the menu at click point
        contextMenuDiv.style.position = 'absolute';
        document.body.appendChild(contextMenuDiv);
        
        // Get pixel coordinates for positioning
        const mapDiv = document.getElementById('map');
        const rect = mapDiv.getBoundingClientRect();
        const x = event.pixel.x + rect.left + window.scrollX;
        const y = event.pixel.y + rect.top + window.scrollY;
        
        contextMenuDiv.style.left = x + 'px';
        contextMenuDiv.style.top = y + 'px';
        
        // Attach click handlers
        document.getElementById('copyMgrs').addEventListener('click', function() {
            navigator.clipboard.writeText(formattedMgrs);
            window.contextMenu.close();
        });
        
        document.getElementById('copyLatLng').addEventListener('click', function() {
            navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            window.contextMenu.close();
        });
        
        document.getElementById('placeMarkerHere').addEventListener('click', function() {
            if (selectedMarkerType) {
                addCustomMarker(event.latLng, selectedMarkerType);
            } else {
                // Fall back to default marker
                const marker = new google.maps.Marker({
                    position: event.latLng,
                    map: map,
                    draggable: true
                });
                markers.push(marker);
                marker.addListener('click', () => selectMarker(marker));
            }
            window.contextMenu.close();
        });
        
        document.getElementById('measureFromHere').addEventListener('click', function() {
            // Enable measure mode if not already enabled
            if (!measureMode) {
                toggleMeasureMode();
            }
            // Add this point as the first measure point
            addMeasurePoint({latLng: event.latLng});
            window.contextMenu.close();
        });
        
        // Close menu on click elsewhere
        window.contextMenu = {
            div: contextMenuDiv,
            close: function() {
                if (contextMenuDiv.parentNode) {
                    contextMenuDiv.parentNode.removeChild(contextMenuDiv);
                }
                window.contextMenu = null;
            }
        };
        
        // Close on map click or move
        google.maps.event.addListenerOnce(map, 'click', function() {
            if (window.contextMenu) window.contextMenu.close();
        });
        
        google.maps.event.addListenerOnce(map, 'dragstart', function() {
            if (window.contextMenu) window.contextMenu.close();
        });
        
        document.addEventListener('click', function onDocClick(e) {
            if (window.contextMenu && !contextMenuDiv.contains(e.target)) {
                window.contextMenu.close();
                document.removeEventListener('click', onDocClick);
            }
        });
        
        // Prevent default context menu
        return false;
    });
}

// Wait for the DOM to be fully loaded before initializing the map
document.addEventListener('DOMContentLoaded', initMap);
