/**
 * Simple SITTEMP - Situational Template Application
 * Main application logic
 */

// ===== Constants =====
const DEFAULT_CENTER = { lat: 35.2625, lng: -116.6800 }; // Fort Irwin / NTC
const DEFAULT_ZOOM = 12;

const COLORS = {
    Green:  '#00AA00',
    Blue:   '#0000FF',
    Red:    '#FF0000',
    Purple: '#800080',
    Orange: '#FF8C00',
    Black:  '#000000',
    White:  '#FFFFFF',
    Grey:   '#808080'
};

// ===== Application State =====
const state = {
    map: null,
    draw: null,
    ready: false,
    currentMode: 'select',
    lineColor: '#FF0000',
    fillColor: '#FF0000',
    fillOpacity: 0.6,
    lineType: 'solid',
    undoStack: [],
    redoStack: [],
    openSubmenu: null,
    // Symbol placement
    pendingSymbolType: null,   // 'equipment' or 'unit'
    pendingSymbolKey: null,    // key in the symbol map
    symbolClickListener: null,
    // Text placement
    textPlacementMode: false,
    textClickListener: null,
    // Map markers for symbols and text (Google Maps markers, outside Terra Draw)
    markers: [],
    // MGRS grid
    mgrsGridVisible: true,
    mgrsGridLines: [],
    mgrsGridLabels: [],
    mgrsGridScale: 1000, // meters
    mgrsGridColor: '#000000',
    // Export pending callback
    exportCallback: null,
};

// ===== Equipment Symbol SVGs =====
// NATO APP-6 style equipment symbols rendered as simple SVGs
function equipmentSVG(key, color) {
    color = color || '#FF0000';
    const svgs = {
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="28" x2="28" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="22" y1="12" x2="28" y2="12" stroke="${color}" stroke-width="2"/>
        </svg>`,
        light_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="10" y1="28" x2="30" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="12" x2="30" y2="28" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="20" r="2" fill="${color}"/>
        </svg>`,
        heavy_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="10" y1="28" x2="30" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="12" x2="30" y2="28" stroke="${color}" stroke-width="2"/>
            <rect x="16" y="16" width="8" height="8" fill="${color}"/>
        </svg>`,
        light_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        heavy_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="${color}"/>
        </svg>`,
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold">OP</text>
        </svg>`,
        arty_op: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="22" r="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="12" x2="20" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        at_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">ATM</text>
        </svg>`,
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">ATG</text>
        </svg>`,
        aa_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">AA</text>
            <line x1="14" y1="30" x2="26" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        aa_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="9" font-weight="bold">SAM</text>
            <line x1="14" y1="30" x2="26" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        fixed_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="20" x2="30" y2="20" stroke="${color}" stroke-width="2"/>
            <line x1="14" y1="28" x2="26" y2="28" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        attack_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="22" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="10" y1="17" x2="30" y2="17" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="12" x2="20" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        utility_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="22" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="10" y1="17" x2="30" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        tank: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="19" x2="20" y2="12" stroke="${color}" stroke-width="2"/>
        </svg>`,
        armored_vehicle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 28 Q20 10 26 28" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2" fill="${color}"/>
        </svg>`,
        aa_radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 28 Q20 10 26 28" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2" fill="${color}"/>
            <line x1="14" y1="32" x2="26" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,
    };
    return svgs[key] || svgs.rifle;
}

// ===== Unit Symbol SVGs =====
// NATO friendly rectangle frame with unit type modifier inside
function unitSVG(key, color) {
    color = color || '#0000FF';
    const frame = `<rect x="2" y="6" width="36" height="24" fill="none" stroke="${color}" stroke-width="2.5" rx="1"/>`;
    const modifiers = {
        infantry: `${frame}<line x1="6" y1="10" x2="34" y2="26" stroke="${color}" stroke-width="2"/><line x1="34" y1="10" x2="6" y2="26" stroke="${color}" stroke-width="2"/>`,
        armor: `${frame}<ellipse cx="20" cy="18" rx="12" ry="7" fill="none" stroke="${color}" stroke-width="2"/>`,
        armored_infantry: `${frame}<ellipse cx="20" cy="18" rx="12" ry="7" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="10" y1="12" x2="30" y2="24" stroke="${color}" stroke-width="1.5"/><line x1="30" y1="12" x2="10" y2="24" stroke="${color}" stroke-width="1.5"/>`,
        artillery: `${frame}<circle cx="20" cy="18" r="5" fill="${color}"/>`,
        engineers: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold">E</text>`,
        aviation: `${frame}<path d="M10 18 L20 10 L30 18" fill="none" stroke="${color}" stroke-width="2"/>`,
        military_intel: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">MI</text>`,
        military_police: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">MP</text>`,
        recon: `${frame}<line x1="6" y1="26" x2="34" y2="10" stroke="${color}" stroke-width="2"/>`,
        signal: `${frame}<path d="M12 24 L16 12 L24 24 L28 12" fill="none" stroke="${color}" stroke-width="2"/>`,
        electronic_warfare: `${frame}<path d="M10 24 L14 12 L22 24 L26 12" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="30" y1="12" x2="30" y2="24" stroke="${color}" stroke-width="1.5"/>`,
    };
    const inner = modifiers[key] || modifiers.infantry;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="36" viewBox="0 0 40 36">${inner}</svg>`;
}

// Equipment definitions
const EQUIPMENT_LIST = [
    { key: 'rifle', name: 'Rifle' },
    { key: 'light_mg', name: 'Light MG' },
    { key: 'heavy_mg', name: 'Heavy MG' },
    { key: 'light_mortar', name: 'Light Mortar' },
    { key: 'heavy_mortar', name: 'Heavy Mortar' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'arty_op', name: 'Arty OP' },
    { key: 'at_missile', name: 'AT Missile' },
    { key: 'at_gun', name: 'AT Gun' },
    { key: 'aa_gun', name: 'AA Gun' },
    { key: 'aa_missile', name: 'AA Missile' },
    { key: 'fixed_wing', name: 'Fixed Wing' },
    { key: 'attack_helo', name: 'Attack Helo' },
    { key: 'utility_helo', name: 'Utility Helo' },
    { key: 'tank', name: 'Tank' },
    { key: 'armored_vehicle', name: 'Armored Veh' },
    { key: 'radar', name: 'Radar' },
    { key: 'aa_radar', name: 'AA Radar' },
];

// Unit definitions
const UNIT_LIST = [
    { key: 'infantry', name: 'Infantry' },
    { key: 'armor', name: 'Armor' },
    { key: 'armored_infantry', name: 'Armored Inf' },
    { key: 'artillery', name: 'Artillery' },
    { key: 'engineers', name: 'Engineers' },
    { key: 'aviation', name: 'Aviation' },
    { key: 'military_intel', name: 'Mil Intel' },
    { key: 'military_police', name: 'Mil Police' },
    { key: 'recon', name: 'Recon' },
    { key: 'signal', name: 'Signal' },
    { key: 'electronic_warfare', name: 'EW' },
];

// Shape definitions
const SHAPE_LIST = [
    { key: 'circle', name: 'Circle', icon: '<circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'rectangle', name: 'Rectangle', icon: '<rect x="3" y="6" width="22" height="16" fill="none" stroke="currentColor" stroke-width="2" rx="1"/>' },
    { key: 'polygon', name: 'Polygon', icon: '<polygon points="14,2 26,10 22,26 6,26 2,10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'linestring', name: 'Line', icon: '<line x1="3" y1="25" x2="25" y2="3" stroke="currentColor" stroke-width="2"/>' },
    { key: 'freehand', name: 'Freehand', icon: '<path d="M3 20 Q8 5 14 15 T25 8" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'triangle', name: 'Triangle', icon: '<polygon points="14,3 26,25 2,25" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'star', name: 'Star', icon: '<polygon points="14,2 17,11 27,11 19,17 22,26 14,21 6,26 9,17 1,11 11,11" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
];

// Line type definitions
const LINE_TYPES = [
    { key: 'solid', name: 'Solid' },
    { key: 'dashed', name: 'Dashed' },
    { key: 'dotted', name: 'Dotted' },
    { key: 'dashdot', name: 'Dash-Dot' },
    { key: 'minebelt', name: 'Mine Belt' },
    { key: 'wire', name: 'Wire Obstacle' },
    { key: 'tankditch', name: 'Tank Ditch' },
];


// ===== Initialization =====

/**
 * Check for API key and load Google Maps
 */
function initApp() {
    // Handle classification modal
    if (!sessionStorage.getItem('sittemp_classified_ack')) {
        document.getElementById('classification-modal').style.display = 'flex';
    } else {
        document.getElementById('classification-modal').style.display = 'none';
    }

    document.getElementById('classification-accept').addEventListener('click', function() {
        sessionStorage.setItem('sittemp_classified_ack', 'true');
        document.getElementById('classification-modal').style.display = 'none';
    });

    // Check for API key
    const storedKey = localStorage.getItem('sittemp_gmaps_key');
    if (storedKey) {
        loadGoogleMaps(storedKey);
    } else {
        // Show API key prompt
        document.getElementById('api-key-dialog').style.display = 'flex';
        document.getElementById('api-key-submit').addEventListener('click', function() {
            const key = document.getElementById('api-key-input').value.trim();
            if (key) {
                localStorage.setItem('sittemp_gmaps_key', key);
                document.getElementById('api-key-dialog').style.display = 'none';
                loadGoogleMaps(key);
            }
        });
        document.getElementById('api-key-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('api-key-submit').click();
        });
    }
}

/**
 * Load Google Maps script dynamically
 */
function loadGoogleMaps(apiKey) {
    window.initMap = initMap;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
}

/**
 * Google Maps callback - initialize map and Terra Draw
 */
function initMap() {
    // Create the Google Map
    state.map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: 'terrain',
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
    });

    // Wait for map projection to be ready before initializing Terra Draw
    state.map.addListener('projection_changed', function() {
        if (state.draw) return; // Only init once
        initTerraDraw();
    });

    // Setup cursor coordinate display
    setupCoordinateDisplay();

    // Setup right-click MGRS copy
    setupRightClickMGRS();

    // Setup toolbar interactions
    setupToolbar();

    // Setup MGRS grid
    setupMGRSGrid();

    // Setup export
    setupExport();
}

/**
 * Initialize Terra Draw with all drawing modes
 */
function initTerraDraw() {
    const {
        TerraDraw, TerraDrawPointMode, TerraDrawLineStringMode,
        TerraDrawPolygonMode, TerraDrawRectangleMode, TerraDrawCircleMode,
        TerraDrawFreehandMode, TerraDrawSelectMode, TerraDrawRenderMode
    } = terraDraw;
    const { TerraDrawGoogleMapsAdapter } = terraDrawGoogleMapsAdapter;

    state.draw = new TerraDraw({
        adapter: new TerraDrawGoogleMapsAdapter({
            map: state.map,
            lib: google.maps,
            coordinatePrecision: 9
        }),
        modes: [
            new TerraDrawPointMode({
                styles: {
                    pointColor: state.lineColor,
                    pointWidth: 6,
                    pointOutlineColor: '#000000',
                    pointOutlineWidth: 2
                }
            }),
            new TerraDrawLineStringMode({
                styles: {
                    lineStringColor: state.lineColor,
                    lineStringWidth: 3
                }
            }),
            new TerraDrawPolygonMode({
                styles: {
                    fillColor: state.fillColor,
                    fillOpacity: state.fillOpacity,
                    outlineColor: state.lineColor,
                    outlineWidth: 2
                }
            }),
            new TerraDrawRectangleMode({
                styles: {
                    fillColor: state.fillColor,
                    fillOpacity: state.fillOpacity,
                    outlineColor: state.lineColor,
                    outlineWidth: 2
                }
            }),
            new TerraDrawCircleMode({
                styles: {
                    fillColor: state.fillColor,
                    fillOpacity: state.fillOpacity,
                    outlineColor: state.lineColor,
                    outlineWidth: 2
                }
            }),
            new TerraDrawFreehandMode({
                styles: {
                    fillColor: state.fillColor,
                    fillOpacity: state.fillOpacity,
                    outlineColor: state.lineColor,
                    outlineWidth: 2
                }
            }),
            new TerraDrawSelectMode({
                flags: {
                    polygon: {
                        feature: {
                            draggable: true,
                            coordinates: { midpoints: true, draggable: true, deletable: true }
                        }
                    },
                    linestring: {
                        feature: {
                            draggable: true,
                            coordinates: { midpoints: true, draggable: true, deletable: true }
                        }
                    },
                    point: {
                        feature: { draggable: true }
                    },
                    rectangle: {
                        feature: {
                            draggable: true,
                            coordinates: { draggable: true },
                            resizable: 'opposite'
                        }
                    },
                    circle: {
                        feature: {
                            draggable: true,
                            coordinates: { draggable: true }
                        }
                    },
                    freehand: {
                        feature: { draggable: true }
                    }
                },
                styles: {
                    selectedPolygonColor: state.lineColor,
                    selectedPolygonFillOpacity: 0.4,
                    selectedPolygonOutlineColor: '#FFFFFF',
                    selectedPolygonOutlineWidth: 2,
                    selectedLineStringColor: '#FFFFFF',
                    selectedLineStringWidth: 3,
                    selectedPointColor: '#FFFFFF',
                    selectedPointWidth: 8,
                    selectedPointOutlineColor: state.lineColor,
                    selectedPointOutlineWidth: 3,
                    selectionPointWidth: 7,
                    selectionPointColor: '#FFFFFF',
                    selectionPointOutlineColor: '#333333',
                    selectionPointOutlineWidth: 2,
                    midPointColor: '#AAAAAA',
                    midPointWidth: 4,
                    midPointOutlineColor: '#FFFFFF',
                    midPointOutlineWidth: 1
                }
            }),
            new TerraDrawRenderMode({
                modeName: 'render',
                styles: {
                    pointColor: '#808080',
                    polygonFillColor: '#808080',
                    polygonFillOpacity: 0.2,
                    polygonOutlineColor: '#808080',
                    polygonOutlineWidth: 1
                }
            })
        ]
    });

    state.draw.start();

    state.draw.on('ready', function() {
        state.ready = true;
        state.draw.setMode('select');
        setActiveTool('select');
        // Push initial empty state as undo baseline
        pushUndoState();
    });

    // Track selected features
    state.selectedFeatureId = null;
    state.draw.on('select', function(id) {
        state.selectedFeatureId = id;
    });
    state.draw.on('deselect', function() {
        state.selectedFeatureId = null;
    });

    // Track changes for undo/redo
    state.draw.on('finish', function(id, context) {
        if (context.action === 'draw') {
            pushUndoState();
            applyLineType(id);
        }
    });

    state.draw.on('change', function(ids, type) {
        if (type === 'delete') {
            pushUndoState();
        }
    });
}


// ===== Coordinate Display =====

function setupCoordinateDisplay() {
    let throttleTimer = null;
    state.map.addListener('mousemove', function(e) {
        if (throttleTimer) return;
        throttleTimer = setTimeout(function() { throttleTimer = null; }, 50);

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        document.getElementById('coord-latlon').textContent =
            lat.toFixed(6) + ', ' + lng.toFixed(6);

        try {
            const mgrsStr = mgrs.forward([lng, lat], 5);
            document.getElementById('coord-mgrs').textContent = mgrsStr;
        } catch (err) {
            document.getElementById('coord-mgrs').textContent = '---';
        }
    });
}


// ===== Right-Click MGRS Copy =====

function setupRightClickMGRS() {
    state.map.addListener('rightclick', function(e) {
        e.domEvent.preventDefault();
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        try {
            const mgrsStr = mgrs.forward([lng, lat], 5);
            navigator.clipboard.writeText(mgrsStr).then(function() {
                showToast('MGRS copied: ' + mgrsStr);
            }).catch(function() {
                showToast('MGRS: ' + mgrsStr + ' (copy failed)');
            });
        } catch (err) {
            showToast('Could not compute MGRS');
        }
    });
}


// ===== Toast =====

function showToast(message, duration) {
    duration = duration || 2000;
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('visible');
    setTimeout(function() { el.classList.remove('visible'); }, duration);
}


// ===== Toolbar Setup =====

function setupToolbar() {
    // Build sub-menus
    buildShapesSubmenu();
    buildEquipmentSubmenu();
    buildUnitsSubmenu();
    buildColorSubmenu();

    // Toolbar button click handlers
    document.getElementById('btn-select').addEventListener('click', function() {
        closeAllSubmenus();
        setActiveTool('select');
        exitSymbolPlacement();
        exitTextPlacement();
        if (state.ready) state.draw.setMode('select');
    });

    document.getElementById('btn-shapes').addEventListener('click', function(e) {
        e.stopPropagation();
        exitSymbolPlacement();
        exitTextPlacement();
        toggleSubmenu('submenu-shapes', 'btn-shapes');
    });

    document.getElementById('btn-equipment').addEventListener('click', function(e) {
        e.stopPropagation();
        exitTextPlacement();
        toggleSubmenu('submenu-equipment', 'btn-equipment');
    });

    document.getElementById('btn-units').addEventListener('click', function(e) {
        e.stopPropagation();
        exitTextPlacement();
        toggleSubmenu('submenu-units', 'btn-units');
    });

    document.getElementById('btn-text').addEventListener('click', function() {
        closeAllSubmenus();
        exitSymbolPlacement();
        setActiveTool('text');
        enterTextPlacement();
    });

    document.getElementById('btn-undo').addEventListener('click', function() {
        performUndo();
    });

    document.getElementById('btn-color').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSubmenu('submenu-color', 'btn-color');
    });

    document.getElementById('btn-redo').addEventListener('click', function() {
        performRedo();
    });

    document.getElementById('btn-clear').addEventListener('click', function() {
        clearSelected();
    });

    document.getElementById('btn-export').addEventListener('click', function() {
        closeAllSubmenus();
        document.getElementById('export-dialog').classList.add('visible');
    });

    // Close submenus on map click
    document.getElementById('map').addEventListener('click', function() {
        closeAllSubmenus();
    });

    // Position submenus relative to their toolbar buttons
    positionSubmenus();
}

function positionSubmenus() {
    const menuMap = {
        'btn-shapes': 'submenu-shapes',
        'btn-equipment': 'submenu-equipment',
        'btn-units': 'submenu-units',
        'btn-color': 'submenu-color',
    };

    for (const [btnId, menuId] of Object.entries(menuMap)) {
        const btn = document.getElementById(btnId);
        const menu = document.getElementById(menuId);
        const rect = btn.getBoundingClientRect();
        menu.style.top = rect.top + 'px';
    }
}

function toggleSubmenu(menuId, btnId) {
    const menu = document.getElementById(menuId);
    const wasVisible = menu.classList.contains('visible');
    closeAllSubmenus();
    if (!wasVisible) {
        menu.classList.add('visible');
        state.openSubmenu = menuId;
        // Reposition
        const btn = document.getElementById(btnId);
        const rect = btn.getBoundingClientRect();
        menu.style.top = rect.top + 'px';
    }
}

function closeAllSubmenus() {
    document.querySelectorAll('.submenu').forEach(function(el) {
        el.classList.remove('visible');
    });
    state.openSubmenu = null;
}

function setActiveTool(tool) {
    document.querySelectorAll('.toolbar-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    const btnMap = {
        select: 'btn-select',
        shapes: 'btn-shapes',
        equipment: 'btn-equipment',
        units: 'btn-units',
        text: 'btn-text',
    };
    if (btnMap[tool]) {
        document.getElementById(btnMap[tool]).classList.add('active');
    }
    state.currentMode = tool;
}


// ===== Shapes Sub-menu =====

function buildShapesSubmenu() {
    const grid = document.getElementById('shape-grid');
    SHAPE_LIST.forEach(function(shape) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.dataset.shape = shape.key;
        item.innerHTML = `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5">${shape.icon}</svg><span>${shape.name}</span>`;
        item.addEventListener('click', function() {
            exitSymbolPlacement();
            exitTextPlacement();
            activateShape(shape.key);
            highlightSubmenuItem(grid, item);
        });
        grid.appendChild(item);
    });

    // Line types
    const list = document.getElementById('line-type-list');
    LINE_TYPES.forEach(function(lt) {
        const item = document.createElement('div');
        item.className = 'submenu-list-item';
        item.dataset.linetype = lt.key;
        const preview = getLinePreviewSVG(lt.key);
        item.innerHTML = `<span style="width:40px;display:inline-block;">${preview}</span><span>${lt.name}</span>`;
        item.addEventListener('click', function() {
            state.lineType = lt.key;
            highlightSubmenuItem(list, item);
        });
        if (lt.key === 'solid') item.classList.add('active');
        list.appendChild(item);
    });
}

function getLinePreviewSVG(type) {
    const c = '#ccc';
    switch (type) {
        case 'solid':    return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/></svg>`;
        case 'dashed':   return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="6,4"/></svg>`;
        case 'dotted':   return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="2,4"/></svg>`;
        case 'dashdot':  return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="8,3,2,3"/></svg>`;
        case 'minebelt': return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/><circle cx="10" cy="5" r="3" fill="${c}"/><circle cx="30" cy="5" r="3" fill="${c}"/></svg>`;
        case 'wire':     return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/><circle cx="10" cy="5" r="3" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="30" cy="5" r="3" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'tankditch':return `<svg width="40" height="10"><polygon points="0,8 5,2 10,8 15,2 20,8 25,2 30,8 35,2 40,8" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        default: return '';
    }
}

function activateShape(key) {
    if (!state.ready) return;
    setActiveTool('shapes');

    if (key === 'triangle') {
        // Use polygon mode - user draws a triangle by placing 3 points
        state.draw.setMode('polygon');
        showToast('Click 3 points, then double-click to close triangle');
    } else if (key === 'star') {
        // Place a star as a symbol (Google Maps marker)
        enterStarPlacement();
    } else {
        // Direct Terra Draw mode
        const modeMap = {
            circle: 'circle',
            rectangle: 'rectangle',
            polygon: 'polygon',
            linestring: 'linestring',
            freehand: 'freehand'
        };
        if (modeMap[key]) {
            state.draw.setMode(modeMap[key]);
        }
    }
    updateDrawStyles();
}

function highlightSubmenuItem(container, active) {
    container.querySelectorAll('.submenu-item, .submenu-list-item').forEach(function(el) {
        el.classList.remove('active');
    });
    active.classList.add('active');
}


// ===== Equipment Sub-menu =====

function buildEquipmentSubmenu() {
    const grid = document.getElementById('equipment-grid');
    EQUIPMENT_LIST.forEach(function(eq) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.innerHTML = `<div style="width:28px;height:28px;">${equipmentSVG(eq.key, state.lineColor)}</div><span>${eq.name}</span>`;
        item.addEventListener('click', function() {
            enterSymbolPlacement('equipment', eq.key);
            closeAllSubmenus();
        });
        grid.appendChild(item);
    });
}


// ===== Units Sub-menu =====

function buildUnitsSubmenu() {
    const grid = document.getElementById('units-grid');
    UNIT_LIST.forEach(function(unit) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.innerHTML = `<div style="width:28px;height:28px;">${unitSVG(unit.key, state.lineColor)}</div><span>${unit.name}</span>`;
        item.addEventListener('click', function() {
            enterSymbolPlacement('unit', unit.key);
            closeAllSubmenus();
        });
        grid.appendChild(item);
    });
}


// ===== Color Sub-menu =====

function buildColorSubmenu() {
    const lineSwatches = document.getElementById('line-color-swatches');
    const fillSwatches = document.getElementById('fill-color-swatches');

    for (const [name, hex] of Object.entries(COLORS)) {
        // Line color
        const lineSwatch = document.createElement('div');
        lineSwatch.className = 'color-swatch' + (hex === state.lineColor ? ' active' : '');
        lineSwatch.style.background = hex;
        if (hex === '#FFFFFF') lineSwatch.style.border = '2px solid #999';
        lineSwatch.title = name;
        lineSwatch.addEventListener('click', function() {
            state.lineColor = hex;
            lineSwatches.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
            lineSwatch.classList.add('active');
            updateDrawStyles();
        });
        lineSwatches.appendChild(lineSwatch);

        // Fill color
        const fillSwatch = document.createElement('div');
        fillSwatch.className = 'color-swatch' + (hex === state.fillColor ? ' active' : '');
        fillSwatch.style.background = hex;
        if (hex === '#FFFFFF') fillSwatch.style.border = '2px solid #999';
        fillSwatch.title = name;
        fillSwatch.addEventListener('click', function() {
            state.fillColor = hex;
            fillSwatches.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
            fillSwatch.classList.add('active');
            updateDrawStyles();
        });
        fillSwatches.appendChild(fillSwatch);
    }

    // Opacity slider
    const slider = document.getElementById('opacity-slider');
    const valueLabel = document.getElementById('opacity-value');
    slider.addEventListener('input', function() {
        state.fillOpacity = parseInt(slider.value) / 100;
        valueLabel.textContent = slider.value + '%';
        updateDrawStyles();
    });
}


// ===== Update Terra Draw Styles =====

function updateDrawStyles() {
    if (!state.draw || !state.ready) return;

    try {
        state.draw.updateModeOptions('polygon', {
            styles: { fillColor: state.fillColor, fillOpacity: state.fillOpacity, outlineColor: state.lineColor, outlineWidth: 2 }
        });
        state.draw.updateModeOptions('rectangle', {
            styles: { fillColor: state.fillColor, fillOpacity: state.fillOpacity, outlineColor: state.lineColor, outlineWidth: 2 }
        });
        state.draw.updateModeOptions('circle', {
            styles: { fillColor: state.fillColor, fillOpacity: state.fillOpacity, outlineColor: state.lineColor, outlineWidth: 2 }
        });
        state.draw.updateModeOptions('freehand', {
            styles: { fillColor: state.fillColor, fillOpacity: state.fillOpacity, outlineColor: state.lineColor, outlineWidth: 2 }
        });
        state.draw.updateModeOptions('linestring', {
            styles: { lineStringColor: state.lineColor, lineStringWidth: 3 }
        });
        state.draw.updateModeOptions('point', {
            styles: { pointColor: state.lineColor, pointWidth: 6, pointOutlineColor: '#000000', pointOutlineWidth: 2 }
        });
    } catch (e) {
        // Styles may fail if mode not yet ready
    }
}


// ===== Symbol Placement =====

function enterSymbolPlacement(type, key) {
    exitSymbolPlacement();
    exitTextPlacement();
    state.pendingSymbolType = type;
    state.pendingSymbolKey = key;

    if (state.ready) {
        state.draw.setMode('select');
    }

    setActiveTool(type === 'equipment' ? 'equipment' : 'units');
    showToast('Click on map to place ' + (type === 'equipment' ?
        EQUIPMENT_LIST.find(function(e) { return e.key === key; }).name :
        UNIT_LIST.find(function(u) { return u.key === key; }).name));

    state.symbolClickListener = state.map.addListener('click', function(e) {
        showSymbolTextDialog(e.latLng);
    });
}

function exitSymbolPlacement() {
    if (state.symbolClickListener) {
        google.maps.event.removeListener(state.symbolClickListener);
        state.symbolClickListener = null;
    }
    state.pendingSymbolType = null;
    state.pendingSymbolKey = null;
}

function showSymbolTextDialog(latLng) {
    const dialog = document.getElementById('symbol-text-dialog');
    dialog.classList.add('visible');
    document.getElementById('symbol-left-text').value = '';
    document.getElementById('symbol-right-text').value = '';
    document.getElementById('symbol-left-text').focus();

    function cleanup() {
        dialog.classList.remove('visible');
        document.getElementById('symbol-text-ok').removeEventListener('click', onOk);
        document.getElementById('symbol-text-cancel').removeEventListener('click', onCancel);
    }

    function onOk() {
        const leftText = document.getElementById('symbol-left-text').value.substring(0, 20);
        const rightText = document.getElementById('symbol-right-text').value.substring(0, 20);
        cleanup();
        placeSymbol(latLng, leftText, rightText);
    }

    function onCancel() {
        cleanup();
    }

    document.getElementById('symbol-text-ok').addEventListener('click', onOk);
    document.getElementById('symbol-text-cancel').addEventListener('click', onCancel);
}

function placeSymbol(latLng, leftText, rightText) {
    const type = state.pendingSymbolType;
    const key = state.pendingSymbolKey;
    if (!type || !key) return;

    const svgString = type === 'equipment' ?
        equipmentSVG(key, state.lineColor) :
        unitSVG(key, state.lineColor);

    const fullSVG = buildSymbolWithLabels(svgString, leftText, rightText, state.lineColor);
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(fullSVG);

    const marker = new google.maps.Marker({
        position: latLng,
        map: state.map,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(120, 50),
            anchor: new google.maps.Point(60, 25)
        },
        draggable: true,
        clickable: true,
        zIndex: 100,
    });

    // Store metadata
    marker._sittemp = {
        type: type,
        key: key,
        leftText: leftText,
        rightText: rightText,
        color: state.lineColor,
    };

    marker.addListener('click', function() {
        // Select this marker for deletion
        state.markers.forEach(function(m) { m._selected = false; });
        marker._selected = true;
        showToast('Symbol selected. Press Clear Selected to delete.');
    });

    state.markers.push(marker);
    pushUndoState();
}

/**
 * Build an SVG that includes the symbol + optional left/right text labels
 */
function buildSymbolWithLabels(svgInner, leftText, rightText, color) {
    // The total SVG is 120 wide: left text (40), symbol (40), right text (40)
    const symbolWidth = 40;
    const totalWidth = 120;
    const totalHeight = 50;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

    // Left text
    if (leftText) {
        svg += `<text x="38" y="30" text-anchor="end" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(leftText)}</text>`;
    }

    // Symbol (centered at x=60)
    svg += `<g transform="translate(40, 5)">${stripSvgWrapper(svgInner)}</g>`;

    // Right text
    if (rightText) {
        svg += `<text x="82" y="30" text-anchor="start" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(rightText)}</text>`;
    }

    svg += '</svg>';
    return svg;
}

function stripSvgWrapper(svgString) {
    // Remove outer <svg> tags to embed inner content
    return svgString.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
}

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


// ===== Star Placement =====

function enterStarPlacement() {
    exitSymbolPlacement();
    exitTextPlacement();
    if (state.ready) state.draw.setMode('select');
    setActiveTool('shapes');
    showToast('Click on map to place a star');

    state.symbolClickListener = state.map.addListener('click', function(e) {
        placeStarMarker(e.latLng);
    });
}

function placeStarMarker(latLng) {
    const color = state.lineColor;
    const fill = state.fillColor;
    const opacity = state.fillOpacity;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"
            fill="${fill}" fill-opacity="${opacity}" stroke="${color}" stroke-width="2"/>
    </svg>`;

    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    const marker = new google.maps.Marker({
        position: latLng,
        map: state.map,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        draggable: true,
        clickable: true,
        zIndex: 100,
    });

    marker._sittemp = { type: 'star', color: color };
    marker.addListener('click', function() {
        state.markers.forEach(function(m) { m._selected = false; });
        marker._selected = true;
        showToast('Star selected. Press Clear Selected to delete.');
    });

    state.markers.push(marker);
    pushUndoState();
}


// ===== Text Placement =====

function enterTextPlacement() {
    if (state.ready) state.draw.setMode('select');
    state.textPlacementMode = true;
    showToast('Click on map to place text');

    state.textClickListener = state.map.addListener('click', function(e) {
        showTextInputDialog(e.latLng);
    });
}

function exitTextPlacement() {
    if (state.textClickListener) {
        google.maps.event.removeListener(state.textClickListener);
        state.textClickListener = null;
    }
    state.textPlacementMode = false;
}

function showTextInputDialog(latLng) {
    const dialog = document.getElementById('text-input-dialog');
    dialog.classList.add('visible');
    const input = document.getElementById('text-label-input');
    input.value = '';
    input.focus();

    function cleanup() {
        dialog.classList.remove('visible');
        document.getElementById('text-ok').removeEventListener('click', onOk);
        document.getElementById('text-cancel').removeEventListener('click', onCancel);
        input.removeEventListener('keydown', onKey);
    }

    function onOk() {
        const text = input.value.trim();
        cleanup();
        if (text) placeTextLabel(latLng, text);
    }

    function onCancel() {
        cleanup();
    }

    function onKey(e) {
        if (e.key === 'Enter') onOk();
        if (e.key === 'Escape') onCancel();
    }

    document.getElementById('text-ok').addEventListener('click', onOk);
    document.getElementById('text-cancel').addEventListener('click', onCancel);
    input.addEventListener('keydown', onKey);
}

function placeTextLabel(latLng, text) {
    const color = state.lineColor;
    const fontSize = 14;
    const padding = 4;
    const charWidth = 8;
    const width = text.length * charWidth + padding * 2;
    const height = fontSize + padding * 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="white" fill-opacity="0.7" rx="2"/>
        <text x="${padding}" y="${fontSize + padding - 2}" fill="${color}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold">${escapeXml(text)}</text>
    </svg>`;

    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    const marker = new google.maps.Marker({
        position: latLng,
        map: state.map,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(width, height),
            anchor: new google.maps.Point(width / 2, height / 2)
        },
        draggable: true,
        clickable: true,
        zIndex: 100,
    });

    marker._sittemp = { type: 'text', text: text, color: color };
    marker.addListener('click', function() {
        state.markers.forEach(function(m) { m._selected = false; });
        marker._selected = true;
        showToast('Text selected. Press Clear Selected to delete.');
    });

    state.markers.push(marker);
    pushUndoState();
}


// ===== Clear Selected =====

function clearSelected() {
    let deleted = false;

    // Delete selected Terra Draw feature
    if (state.draw && state.ready && state.selectedFeatureId) {
        try {
            state.draw.removeFeatures([state.selectedFeatureId]);
            // Also remove any associated line overlay
            if (state._lineOverlays && state._lineOverlays[state.selectedFeatureId]) {
                state._lineOverlays[state.selectedFeatureId].setMap(null);
                delete state._lineOverlays[state.selectedFeatureId];
            }
            state.selectedFeatureId = null;
            deleted = true;
        } catch (e) {
            // Ignore errors
        }
    }

    // Delete selected markers
    state.markers = state.markers.filter(function(m) {
        if (m._selected) {
            m.setMap(null);
            deleted = true;
            return false;
        }
        return true;
    });

    if (deleted) {
        pushUndoState();
        showToast('Deleted');
    } else {
        showToast('Nothing selected');
    }
}


// ===== Undo / Redo =====

function pushUndoState() {
    const snapshot = {
        features: state.draw ? state.draw.getSnapshot().filter(function(f) {
            // Filter out Terra Draw internal selection helper features
            return !f.properties.selectionPoint && !f.properties.midPoint;
        }).map(function(f) {
            // Strip selection state from user features before saving
            const props = Object.assign({}, f.properties);
            delete props.selected;
            return Object.assign({}, f, { properties: props });
        }) : [],
        markers: state.markers.map(function(m) {
            return {
                position: { lat: m.getPosition().lat(), lng: m.getPosition().lng() },
                sittemp: m._sittemp,
            };
        })
    };
    state.undoStack.push(JSON.stringify(snapshot));
    state.redoStack = []; // Clear redo on new action

    // Limit stack size
    if (state.undoStack.length > 50) state.undoStack.shift();
}

function performUndo() {
    if (state.undoStack.length < 2) {
        showToast('Nothing to undo');
        return;
    }

    const current = state.undoStack.pop();
    state.redoStack.push(current);
    const prev = state.undoStack[state.undoStack.length - 1];
    restoreState(prev);
    showToast('Undo');
}

function performRedo() {
    if (state.redoStack.length === 0) {
        showToast('Nothing to redo');
        return;
    }

    const next = state.redoStack.pop();
    state.undoStack.push(next);
    restoreState(next);
    showToast('Redo');
}

function restoreState(stateJson) {
    const saved = JSON.parse(stateJson);

    // Restore Terra Draw features
    if (state.draw && state.ready) {
        state.draw.clear();
        if (saved.features.length > 0) {
            try {
                state.draw.addFeatures(saved.features);
            } catch (e) {
                // Some features may fail to restore
            }
        }
    }

    // Restore markers
    state.markers.forEach(function(m) { m.setMap(null); });
    state.markers = [];

    saved.markers.forEach(function(data) {
        recreateMarker(data);
    });
}

function recreateMarker(data) {
    const info = data.sittemp;
    let iconUrl, size, anchor;

    if (info.type === 'equipment') {
        const svgFull = buildSymbolWithLabels(
            equipmentSVG(info.key, info.color),
            info.leftText, info.rightText, info.color
        );
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgFull);
        size = new google.maps.Size(120, 50);
        anchor = new google.maps.Point(60, 25);
    } else if (info.type === 'unit') {
        const svgFull = buildSymbolWithLabels(
            unitSVG(info.key, info.color),
            info.leftText, info.rightText, info.color
        );
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgFull);
        size = new google.maps.Size(120, 50);
        anchor = new google.maps.Point(60, 25);
    } else if (info.type === 'star') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"
                fill="${info.color}" stroke="${info.color}" stroke-width="2"/>
        </svg>`;
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        size = new google.maps.Size(30, 30);
        anchor = new google.maps.Point(15, 15);
    } else if (info.type === 'text') {
        const text = info.text;
        const fontSize = 14;
        const padding = 4;
        const charWidth = 8;
        const width = text.length * charWidth + padding * 2;
        const height = fontSize + padding * 2;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect x="0" y="0" width="${width}" height="${height}" fill="white" fill-opacity="0.7" rx="2"/>
            <text x="${padding}" y="${fontSize + padding - 2}" fill="${info.color}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold">${escapeXml(text)}</text>
        </svg>`;
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        size = new google.maps.Size(width, height);
        anchor = new google.maps.Point(width / 2, height / 2);
    } else {
        return;
    }

    const marker = new google.maps.Marker({
        position: data.position,
        map: state.map,
        icon: { url: iconUrl, scaledSize: size, anchor: anchor },
        draggable: true,
        clickable: true,
        zIndex: 100,
    });

    marker._sittemp = info;
    marker.addListener('click', function() {
        state.markers.forEach(function(m) { m._selected = false; });
        marker._selected = true;
        showToast('Selected. Press Clear Selected to delete.');
    });

    state.markers.push(marker);
}


// ===== Line Type Styling =====
// Apply specialty line types as parallel Google Maps Polylines

function applyLineType(featureId) {
    if (state.lineType === 'solid') return;
    if (!state.draw) return;

    const feature = state.draw.getSnapshotFeature(featureId);
    if (!feature || feature.geometry.type !== 'LineString') return;

    const path = feature.geometry.coordinates.map(function(c) {
        return { lat: c[1], lng: c[0] };
    });

    const color = state.lineColor;

    // Create a styled Google Maps Polyline on top
    let polyline;

    switch (state.lineType) {
        case 'dashed':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 0,
                strokeWeight: 3,
                icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: 3, scale: 3 },
                    offset: '0',
                    repeat: '15px'
                }],
                map: state.map
            });
            break;
        case 'dotted':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 0,
                strokeWeight: 3,
                icons: [{
                    icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: 2 },
                    offset: '0',
                    repeat: '10px'
                }],
                map: state.map
            });
            break;
        case 'dashdot':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 0,
                strokeWeight: 3,
                icons: [
                    { icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: 3, scale: 3 }, offset: '0', repeat: '25px' },
                    { icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: 2 }, offset: '18px', repeat: '25px' }
                ],
                map: state.map
            });
            break;
        case 'minebelt':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 1,
                strokeWeight: 2,
                icons: [{
                    icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeColor: color, strokeWeight: 1, scale: 4 },
                    offset: '0',
                    repeat: '20px'
                }],
                map: state.map
            });
            break;
        case 'wire':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 1,
                strokeWeight: 2,
                icons: [{
                    icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 0, strokeColor: color, strokeWeight: 1.5, scale: 4 },
                    offset: '0',
                    repeat: '18px'
                }],
                map: state.map
            });
            break;
        case 'tankditch':
            polyline = new google.maps.Polyline({
                path: path,
                strokeColor: color,
                strokeOpacity: 0,
                strokeWeight: 3,
                icons: [{
                    icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, fillOpacity: 1, fillColor: color, strokeColor: color, strokeWeight: 1, scale: 3 },
                    offset: '0',
                    repeat: '14px'
                }],
                map: state.map
            });
            break;
    }

    // Store polyline so it can be cleaned up
    if (polyline) {
        if (!state._lineOverlays) state._lineOverlays = {};
        state._lineOverlays[featureId] = polyline;
    }
}


// ===== MGRS Grid Overlay =====

function setupMGRSGrid() {
    document.getElementById('grid-toggle').addEventListener('click', function() {
        state.mgrsGridVisible = !state.mgrsGridVisible;
        this.classList.toggle('active', state.mgrsGridVisible);
        drawMGRSGrid();
    });

    document.getElementById('grid-scale').addEventListener('change', function() {
        state.mgrsGridScale = parseInt(this.value);
        drawMGRSGrid();
    });

    document.getElementById('grid-color').addEventListener('change', function() {
        state.mgrsGridColor = this.value;
        drawMGRSGrid();
    });

    // Redraw on map move
    state.map.addListener('idle', function() {
        drawMGRSGrid();
    });

    // Initial draw
    setTimeout(drawMGRSGrid, 1000);
}

function drawMGRSGrid() {
    // Clear existing grid
    clearMGRSGrid();

    if (!state.mgrsGridVisible) return;

    const map = state.map;
    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom();

    // Don't render grid at very low zoom levels
    if (zoom < 8 && state.mgrsGridScale <= 1000) return;
    if (zoom < 6 && state.mgrsGridScale <= 10000) return;
    if (zoom < 4) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const color = state.mgrsGridColor;
    const scale = state.mgrsGridScale; // meters

    // Convert scale to approximate degrees
    // At equator: 1 degree latitude ~ 111,000m
    // 1 degree longitude varies with latitude
    const midLat = (ne.lat() + sw.lat()) / 2;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(midLat * Math.PI / 180);

    const degLat = scale / metersPerDegreeLat;
    const degLng = scale / metersPerDegreeLng;

    // Snap grid to clean intervals
    const startLat = Math.floor(sw.lat() / degLat) * degLat;
    const endLat = Math.ceil(ne.lat() / degLat) * degLat;
    const startLng = Math.floor(sw.lng() / degLng) * degLng;
    const endLng = Math.ceil(ne.lng() / degLng) * degLng;

    // Limit number of lines for performance
    const maxLines = 100;
    const latLines = Math.min(Math.ceil((endLat - startLat) / degLat), maxLines);
    const lngLines = Math.min(Math.ceil((endLng - startLng) / degLng), maxLines);

    if (latLines > maxLines || lngLines > maxLines) return;

    // Draw horizontal lines (constant latitude)
    for (let lat = startLat; lat <= endLat; lat += degLat) {
        const line = new google.maps.Polyline({
            path: [
                { lat: lat, lng: startLng },
                { lat: lat, lng: endLng }
            ],
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 0.8,
            map: map,
            clickable: false,
            zIndex: -1,
        });
        state.mgrsGridLines.push(line);

        // Northing label on left edge
        try {
            const mgrsStr = mgrs.forward([sw.lng() + 0.001, lat], 5);
            // Extract northing digits (last 5 chars of MGRS string)
            const northing = mgrsStr.slice(-5);
            addGridLabel(lat, sw.lng() + 0.003, northing, color);
        } catch (e) { /* skip label */ }
    }

    // Draw vertical lines (constant longitude)
    for (let lng = startLng; lng <= endLng; lng += degLng) {
        const line = new google.maps.Polyline({
            path: [
                { lat: startLat, lng: lng },
                { lat: endLat, lng: lng }
            ],
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 0.8,
            map: map,
            clickable: false,
            zIndex: -1,
        });
        state.mgrsGridLines.push(line);

        // Easting label on bottom edge
        try {
            const mgrsStr = mgrs.forward([lng, sw.lat() + 0.001], 5);
            // Extract easting digits (5 chars before the last 5)
            const easting = mgrsStr.slice(-10, -5);
            addGridLabel(sw.lat() + 0.002, lng, easting, color);
        } catch (e) { /* skip label */ }
    }
}

function addGridLabel(lat, lng, text, color) {
    const label = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: state.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
        },
        label: {
            text: text,
            color: color,
            fontSize: '10px',
            fontWeight: 'bold',
            className: 'mgrs-grid-label'
        },
        clickable: false,
        zIndex: -1,
    });
    state.mgrsGridLabels.push(label);
}

function clearMGRSGrid() {
    state.mgrsGridLines.forEach(function(line) { line.setMap(null); });
    state.mgrsGridLines = [];
    state.mgrsGridLabels.forEach(function(label) { label.setMap(null); });
    state.mgrsGridLabels = [];
}


// ===== Export =====

function setupExport() {
    document.getElementById('export-close').addEventListener('click', function() {
        document.getElementById('export-dialog').classList.remove('visible');
    });

    document.getElementById('export-kml').addEventListener('click', function() {
        document.getElementById('export-dialog').classList.remove('visible');
        showInterstitial(function() { exportKML(); });
    });

    document.getElementById('export-pdf').addEventListener('click', function() {
        document.getElementById('export-dialog').classList.remove('visible');
        showPDFSizeDialog();
    });

    document.getElementById('export-screenshot').addEventListener('click', function() {
        document.getElementById('export-dialog').classList.remove('visible');
        exportScreenshot();
    });

    // PDF size dialog
    document.querySelectorAll('.size-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
            const size = this.dataset.size;
            document.getElementById('pdf-size-dialog').classList.remove('visible');
            showInterstitial(function() { exportPDF(size); });
        });
    });

    document.getElementById('pdf-size-cancel').addEventListener('click', function() {
        document.getElementById('pdf-size-dialog').classList.remove('visible');
    });
}

function showPDFSizeDialog() {
    document.getElementById('pdf-size-dialog').classList.add('visible');
}

/**
 * Show interstitial ad (simulated 5-second countdown)
 */
function showInterstitial(callback) {
    const dialog = document.getElementById('interstitial-ad');
    const timerEl = document.getElementById('countdown-timer');
    dialog.classList.add('visible');

    let seconds = 5;
    timerEl.textContent = seconds;

    const interval = setInterval(function() {
        seconds--;
        timerEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            dialog.classList.remove('visible');
            callback();
        }
    }, 1000);
}

/**
 * Export all features as KML
 */
function exportKML() {
    let features = [];

    // Get Terra Draw features
    if (state.draw) {
        const snapshot = state.draw.getSnapshot().filter(function(f) {
            return !f.properties.selectionPoint && !f.properties.midPoint;
        });
        features = features.concat(snapshot);
    }

    // Build KML document
    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kml += '<Document>\n';
    kml += '<name>Simple SITTEMP Export</name>\n';

    // Add Terra Draw features
    features.forEach(function(f, i) {
        kml += featureToKML(f, i);
    });

    // Add markers
    state.markers.forEach(function(m, i) {
        const pos = m.getPosition();
        kml += '<Placemark>\n';
        kml += '<name>' + escapeXml((m._sittemp && m._sittemp.text) || (m._sittemp && m._sittemp.key) || 'Marker ' + i) + '</name>\n';
        kml += '<Point><coordinates>' + pos.lng() + ',' + pos.lat() + ',0</coordinates></Point>\n';
        kml += '</Placemark>\n';
    });

    kml += '</Document>\n</kml>';

    downloadFile('sittemp_export.kml', kml, 'application/vnd.google-earth.kml+xml');
    showToast('KML exported');
}

function featureToKML(feature, index) {
    let kml = '<Placemark>\n';
    kml += '<name>Feature ' + index + '</name>\n';

    const geom = feature.geometry;
    if (geom.type === 'Point') {
        kml += '<Point><coordinates>' + geom.coordinates[0] + ',' + geom.coordinates[1] + ',0</coordinates></Point>\n';
    } else if (geom.type === 'LineString') {
        kml += '<LineString><coordinates>\n';
        geom.coordinates.forEach(function(c) {
            kml += c[0] + ',' + c[1] + ',0\n';
        });
        kml += '</coordinates></LineString>\n';
    } else if (geom.type === 'Polygon') {
        kml += '<Polygon><outerBoundaryIs><LinearRing><coordinates>\n';
        geom.coordinates[0].forEach(function(c) {
            kml += c[0] + ',' + c[1] + ',0\n';
        });
        kml += '</coordinates></LinearRing></outerBoundaryIs></Polygon>\n';
    }

    kml += '</Placemark>\n';
    return kml;
}

/**
 * Export as PDF
 */
function exportPDF(pageSize) {
    const container = document.getElementById('map-container');

    // Page sizes in points (72 dpi)
    const sizes = {
        letter: [612, 792],    // 8.5 x 11 inches
        tabloid: [792, 1224],  // 11 x 17 inches
        arch: [1296, 1728],    // 18 x 24 inches
    };

    const [width, height] = sizes[pageSize] || sizes.letter;

    showToast('Generating PDF...');

    html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
    }).then(function(canvas) {
        const { jsPDF } = window.jspdf;
        const orientation = width > height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'pt',
            format: [width, height]
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        pdf.save('sittemp_export.pdf');
        showToast('PDF exported');
    }).catch(function(err) {
        showToast('PDF export failed');
        console.error('PDF export error:', err);
    });
}

/**
 * Export as screenshot (PNG)
 */
function exportScreenshot() {
    const container = document.getElementById('map-container');
    const banner = document.getElementById('banner-ad');

    // Hide ad banner for screenshot
    banner.style.display = 'none';

    showToast('Capturing screenshot...');

    html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
    }).then(function(canvas) {
        // Restore ad banner
        banner.style.display = 'flex';

        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sittemp_screenshot.png';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Screenshot saved');
        });
    }).catch(function(err) {
        banner.style.display = 'flex';
        showToast('Screenshot failed');
        console.error('Screenshot error:', err);
    });
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}


// ===== Start the App =====

document.addEventListener('DOMContentLoaded', initApp);
