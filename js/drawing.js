/**
 * Simple SITTEMP - Drawing Module
 *
 * Terra Draw initialization, shape activation, symbol/text/star placement,
 * line-type styling, undo/redo, and draw-style updates.
 */

import { get, set, subscribe, MAX_UNDO_STATES } from './state.js';
import {
    equipmentSVG, unitSVG, enemyUnitSVG, EQUIPMENT_LIST, UNIT_LIST, ENEMY_UNIT_LIST,
    buildSymbolWithLabels, escapeXml
} from './symbols.js';
import { showToast } from './toolbar.js';

// ===== Terra Draw Init =====

export function initTerraDraw() {
    const {
        TerraDraw, TerraDrawPointMode, TerraDrawLineStringMode,
        TerraDrawPolygonMode, TerraDrawRectangleMode, TerraDrawCircleMode,
        TerraDrawFreehandMode, TerraDrawSelectMode, TerraDrawRenderMode
    } = terraDraw;
    const { TerraDrawGoogleMapsAdapter } = terraDrawGoogleMapsAdapter;

    const map = get('map');
    const lineColor = get('lineColor');
    const fillColor = get('fillColor');
    const fillOpacity = get('fillOpacity');
    const sw = get('symbolStrokeWidth') || 2;

    const draw = new TerraDraw({
        adapter: new TerraDrawGoogleMapsAdapter({
            map: map,
            lib: google.maps,
            coordinatePrecision: 9
        }),
        modes: [
            new TerraDrawPointMode({
                styles: { pointColor: lineColor, pointWidth: 6, pointOutlineColor: '#000000', pointOutlineWidth: 2 }
            }),
            new TerraDrawLineStringMode({
                styles: {
                    lineStringColor: lineColor,
                    lineStringWidth: sw,
                    lineStringOpacity: function (feature) {
                        var flt = get('featureLineTypes');
                        var lt = flt[feature.id];
                        return (lt && lt !== 'solid') ? 0 : 1;
                    }
                }
            }),
            new TerraDrawPolygonMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: sw }
            }),
            new TerraDrawRectangleMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: sw }
            }),
            new TerraDrawCircleMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: sw }
            }),
            new TerraDrawFreehandMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: sw }
            }),
            new TerraDrawSelectMode({
                flags: {
                    polygon: { feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } } },
                    linestring: { feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } } },
                    point: { feature: { draggable: true } },
                    rectangle: { feature: { draggable: true, coordinates: { draggable: true }, resizable: 'opposite' } },
                    circle: { feature: { draggable: true, coordinates: { draggable: true } } },
                    freehand: { feature: { draggable: true } }
                },
                styles: {
                    selectedPolygonColor: lineColor,
                    selectedPolygonFillOpacity: 0.4,
                    selectedPolygonOutlineColor: '#FFFFFF',
                    selectedPolygonOutlineWidth: 2,
                    selectedLineStringColor: function (feature) {
                        var flt = get('featureLineTypes');
                        var lt = flt[feature.id];
                        return (lt && lt !== 'solid') ? 'rgba(0,0,0,0)' : '#FFFFFF';
                    },
                    selectedLineStringWidth: 3,
                    selectedPointColor: '#FFFFFF',
                    selectedPointWidth: 8,
                    selectedPointOutlineColor: lineColor,
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

    set('draw', draw);
    draw.start();

    draw.on('ready', function () {
        set('ready', true);
        draw.setMode('select');
        pushUndoState();
    });

    draw.on('select', function (id) { set('selectedFeatureId', id); });
    draw.on('deselect', function () { set('selectedFeatureId', null); });

    draw.on('finish', function (id, context) {
        if (context.action === 'draw') {
            pushUndoState();
            applyLineType(id);
        }
    });

    draw.on('change', function (ids, type) {
        if (type === 'delete') pushUndoState();

        // Sync overlay positions when features are updated (dragged/edited)
        if (type === 'update') {
            var overlays = get('lineOverlays');
            ids.forEach(function (id) {
                if (overlays[id]) {
                    try {
                        var feature = draw.getSnapshotFeature(id);
                        if (feature && feature.geometry.type === 'LineString') {
                            var newPath = feature.geometry.coordinates.map(function (c) {
                                return { lat: c[1], lng: c[0] };
                            });
                            overlays[id].setPath(newPath);
                        }
                    } catch (e) { /* feature may not exist yet */ }
                }
            });
        }
    });
}

// ===== Update Terra Draw Styles =====
// Subscribes to color/opacity changes so styles stay in sync automatically.

function updateDrawStyles() {
    const draw = get('draw');
    if (!draw || !get('ready')) return;

    const lineColor = get('lineColor');
    const fillColor = get('fillColor');
    const fillOpacity = get('fillOpacity');
    const sw = get('symbolStrokeWidth') || 2;

    try {
        draw.updateModeOptions('polygon', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: sw } });
        draw.updateModeOptions('rectangle', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: sw } });
        draw.updateModeOptions('circle', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: sw } });
        draw.updateModeOptions('freehand', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: sw } });
        draw.updateModeOptions('linestring', { styles: {
            lineStringColor: lineColor, lineStringWidth: sw,
            lineStringOpacity: function (feature) {
                var flt = get('featureLineTypes');
                var lt = flt[feature.id];
                return (lt && lt !== 'solid') ? 0 : 1;
            }
        } });
        draw.updateModeOptions('point', { styles: { pointColor: lineColor, pointWidth: 6, pointOutlineColor: '#000000', pointOutlineWidth: 2 } });
    } catch (e) {
        // Styles may fail if mode not yet ready
    }
}

// Auto-update draw styles when colors or stroke width change
subscribe(['lineColor', 'fillColor', 'fillOpacity', 'symbolStrokeWidth'], updateDrawStyles);

// ===== Shape Activation =====

export function activateShape(key) {
    if (!get('ready')) return;
    exitTextPlacement();
    exitSymbolPlacement();
    const draw = get('draw');

    if (key === 'triangle') {
        enterTrianglePlacement();
    } else if (key === 'star') {
        enterStarPlacement();
    } else {
        const modeMap = { circle: 'circle', rectangle: 'rectangle', polygon: 'polygon', linestring: 'linestring', freehand: 'freehand' };
        if (modeMap[key]) draw.setMode(modeMap[key]);
    }
}

// ===== Symbol Placement =====

export function enterSymbolPlacement(type, key) {
    exitSymbolPlacement();
    exitTextPlacement();
    set('pendingSymbolType', type);
    set('pendingSymbolKey', key);

    const draw = get('draw');
    if (get('ready')) draw.setMode('select');

    var found;
    if (type === 'equipment') {
        found = EQUIPMENT_LIST.find(function (e) { return e.key === key; });
    } else if (type === 'enemy_unit') {
        found = ENEMY_UNIT_LIST.find(function (u) { return u.key === key; });
    } else {
        found = UNIT_LIST.find(function (u) { return u.key === key; });
    }
    const name = found ? found.name : key;
    showToast('Click on map to place ' + name);

    const map = get('map');
    const listener = map.addListener('click', function (e) {
        showSymbolTextDialog(e.latLng);
    });
    set('symbolClickListener', listener);
}

export function exitSymbolPlacement() {
    const listener = get('symbolClickListener');
    if (listener) {
        google.maps.event.removeListener(listener);
        set('symbolClickListener', null);
    }
    set('pendingSymbolType', null);
    set('pendingSymbolKey', null);
}

function showSymbolTextDialog(latLng) {
    const dialog = document.getElementById('symbol-text-dialog');
    if (dialog.classList.contains('visible')) return; // Prevent re-entrant calls
    dialog.classList.add('visible');
    document.getElementById('symbol-left-text').value = '';
    document.getElementById('symbol-right-text').value = '';
    document.getElementById('symbol-echelon').value = 'none';
    document.getElementById('symbol-left-text').focus();

    function cleanup() {
        dialog.classList.remove('visible');
        document.getElementById('symbol-text-ok').removeEventListener('click', onOk);
        document.getElementById('symbol-text-cancel').removeEventListener('click', onCancel);
    }
    function onOk() {
        const leftText = document.getElementById('symbol-left-text').value.substring(0, 20);
        const rightText = document.getElementById('symbol-right-text').value.substring(0, 20);
        const echelon = document.getElementById('symbol-echelon').value;
        cleanup();
        placeSymbol(latLng, leftText, rightText, echelon);
    }
    function onCancel() { cleanup(); }

    document.getElementById('symbol-text-ok').addEventListener('click', onOk);
    document.getElementById('symbol-text-cancel').addEventListener('click', onCancel);
}

function placeSymbol(latLng, leftText, rightText, echelon) {
    const type = get('pendingSymbolType');
    const key = get('pendingSymbolKey');
    if (!type || !key) return;

    echelon = echelon || 'none';
    const color = get('lineColor');
    const strokeWidth = get('symbolStrokeWidth') || 2;
    var svgString;
    if (type === 'equipment') {
        svgString = equipmentSVG(key, color, strokeWidth);
    } else if (type === 'enemy_unit') {
        svgString = enemyUnitSVG(key, color, strokeWidth);
    } else {
        svgString = unitSVG(key, color, strokeWidth);
    }
    const fullSVG = buildSymbolWithLabels(svgString, leftText, rightText, color, 0, echelon);

    const scale = get('symbolScale') || 1.0;
    const echelonH = (echelon && echelon !== 'none') ? 14 : 0;
    const h = 50 + echelonH;
    const sittemp = { type, key, leftText, rightText, color, strokeWidth, symbolScale: scale, rotation: 0, echelon: echelon };
    createMapMarker(latLng, fullSVG, new google.maps.Size(150 * scale, h * scale), new google.maps.Point(75 * scale, (h / 2) * scale), sittemp);
    pushUndoState();
}

// ===== Star Placement =====

function enterStarPlacement() {
    exitSymbolPlacement();
    exitTextPlacement();
    if (get('ready')) get('draw').setMode('select');
    showToast('Click on map to place a star');

    const map = get('map');
    const listener = map.addListener('click', function (e) { placeStarMarker(e.latLng); });
    set('symbolClickListener', listener);
}

function placeStarMarker(latLng) {
    const color = get('lineColor');
    const fill = get('fillColor');
    const opacity = get('fillOpacity');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"
            fill="${fill}" fill-opacity="${opacity}" stroke="${color}" stroke-width="2"/>
    </svg>`;

    const scale = get('symbolScale') || 1.0;
    createMapMarker(latLng, svg, new google.maps.Size(30 * scale, 30 * scale), new google.maps.Point(15 * scale, 15 * scale), { type: 'star', color, fill, fillOpacity: opacity, symbolScale: scale });
    pushUndoState();
}

// ===== Triangle Placement =====

function enterTrianglePlacement() {
    exitSymbolPlacement();
    exitTextPlacement();
    if (get('ready')) get('draw').setMode('select');
    showToast('Click on map to place a triangle');

    const map = get('map');
    const listener = map.addListener('click', function (e) { placeTriangleMarker(e.latLng); });
    set('symbolClickListener', listener);
}

function placeTriangleMarker(latLng) {
    const color = get('lineColor');
    const fill = get('fillColor');
    const opacity = get('fillOpacity');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,2 28,28 2,28"
            fill="${fill}" fill-opacity="${opacity}" stroke="${color}" stroke-width="2"/>
    </svg>`;

    const scale = get('symbolScale') || 1.0;
    createMapMarker(latLng, svg, new google.maps.Size(30 * scale, 30 * scale), new google.maps.Point(15 * scale, 15 * scale), { type: 'triangle', color, fill, fillOpacity: opacity, symbolScale: scale });
    pushUndoState();
}

// ===== Text Placement =====

export function enterTextPlacement() {
    exitTextPlacement(); // Clean up any existing listener first
    if (get('ready')) get('draw').setMode('select');
    set('textPlacementMode', true);
    showToast('Click on map to place text');

    const map = get('map');
    const listener = map.addListener('click', function (e) { showTextInputDialog(e.latLng); });
    set('textClickListener', listener);
}

export function exitTextPlacement() {
    const listener = get('textClickListener');
    if (listener) {
        google.maps.event.removeListener(listener);
        set('textClickListener', null);
    }
    set('textPlacementMode', false);
}

function showTextInputDialog(latLng) {
    // Prevent re-entrant calls — if dialog already visible, ignore
    const dialog = document.getElementById('text-input-dialog');
    if (dialog.classList.contains('visible')) return;

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
    function onCancel() { cleanup(); }
    function onKey(e) {
        if (e.key === 'Enter') onOk();
        if (e.key === 'Escape') onCancel();
    }

    document.getElementById('text-ok').addEventListener('click', onOk);
    document.getElementById('text-cancel').addEventListener('click', onCancel);
    input.addEventListener('keydown', onKey);
}

/**
 * Build an SVG string for a text label with full font styling.
 * @returns {{ svg: string, width: number, height: number }}
 */
export function buildTextSVG(text, color, fontSize, fontBold, fontItalic, fontUnderline, fontStrikethrough) {
    var padding = 4;
    // charWidth scales proportionally with fontSize; base ratio from original: 8px at 14px font
    var charWidth = fontSize * (8 / 14);
    if (fontBold) charWidth *= 1.07;
    if (fontItalic) charWidth *= 1.03;

    var width = Math.ceil(text.length * charWidth + padding * 2);
    var height = Math.ceil(fontSize + padding * 2);

    var fontWeight = fontBold ? 'bold' : 'normal';
    var fontStyle = fontItalic ? 'italic' : 'normal';
    var textY = fontSize + padding - 2;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">';

    svg += '<text x="' + padding + '" y="' + textY + '" fill="' + color + '"'
        + ' font-size="' + fontSize + '"'
        + ' font-family="Arial,sans-serif"'
        + ' font-weight="' + fontWeight + '"'
        + ' font-style="' + fontStyle + '"'
        + '>' + escapeXml(text) + '</text>';

    var textWidth = text.length * charWidth;

    if (fontUnderline) {
        var underlineY = textY + 2;
        svg += '<line x1="' + padding + '" y1="' + underlineY + '" x2="' + (padding + textWidth) + '" y2="' + underlineY + '" stroke="' + color + '" stroke-width="1"/>';
    }

    if (fontStrikethrough) {
        var strikeY = Math.round(textY - fontSize * 0.35);
        svg += '<line x1="' + padding + '" y1="' + strikeY + '" x2="' + (padding + textWidth) + '" y2="' + strikeY + '" stroke="' + color + '" stroke-width="1"/>';
    }

    svg += '</svg>';
    return { svg: svg, width: width, height: height };
}

function placeTextLabel(latLng, text) {
    const color = get('lineColor');
    const fontSize = get('fontSize');
    const fontBold = get('fontBold');
    const fontItalic = get('fontItalic');
    const fontUnderline = get('fontUnderline');
    const fontStrikethrough = get('fontStrikethrough');

    const result = buildTextSVG(text, color, fontSize, fontBold, fontItalic, fontUnderline, fontStrikethrough);

    createMapMarker(latLng, result.svg, new google.maps.Size(result.width, result.height), new google.maps.Point(result.width / 2, result.height / 2),
        { type: 'text', text, color, fontSize, fontBold, fontItalic, fontUnderline, fontStrikethrough });
    pushUndoState();
}

// ===== Shared Marker Factory =====

function createMapMarker(latLng, svgString, size, anchor, sittempData) {
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);
    const map = get('map');
    const markers = get('markers');

    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: { url: iconUrl, scaledSize: size, anchor: anchor },
        draggable: true,
        clickable: true,
        optimized: false,
        zIndex: 100,
    });

    marker._sittemp = sittempData;
    marker.addListener('click', function () {
        get('markers').forEach(function (m) { m._selected = false; });
        marker._selected = true;

        // Sync font state when selecting a text marker
        if (marker._sittemp && marker._sittemp.type === 'text') {
            var info = marker._sittemp;
            set('fontSize', info.fontSize !== undefined ? info.fontSize : 14);
            set('fontBold', info.fontBold !== undefined ? info.fontBold : true);
            set('fontItalic', info.fontItalic !== undefined ? info.fontItalic : false);
            set('fontUnderline', info.fontUnderline !== undefined ? info.fontUnderline : false);
            set('fontStrikethrough', info.fontStrikethrough !== undefined ? info.fontStrikethrough : false);
        }

        if (marker._sittemp && (marker._sittemp.type === 'equipment' || marker._sittemp.type === 'unit' || marker._sittemp.type === 'enemy_unit')) {
            showToast('Selected. R / Shift+R to rotate.');
        } else {
            showToast('Selected. Press Clear Selected to delete.');
        }
    });

    markers.push(marker);
    // markers array is mutated in-place, no need to set() again
}

// ===== Clear Selected =====

export function clearSelected() {
    let deleted = false;
    const draw = get('draw');
    const selectedId = get('selectedFeatureId');
    const lineOverlays = get('lineOverlays');

    if (draw && get('ready') && selectedId) {
        try {
            draw.removeFeatures([selectedId]);
            if (lineOverlays[selectedId]) {
                lineOverlays[selectedId].setMap(null);
                delete lineOverlays[selectedId];
            }
            set('selectedFeatureId', null);
            deleted = true;
        } catch (e) { /* ignore */ }
    }

    const markers = get('markers');
    const remaining = markers.filter(function (m) {
        if (m._selected) {
            m.setMap(null);
            deleted = true;
            return false;
        }
        return true;
    });
    // Replace array contents in-place
    markers.length = 0;
    markers.push.apply(markers, remaining);

    if (deleted) {
        pushUndoState();
        showToast('Deleted');
    } else {
        showToast('Nothing selected');
    }
}

// ===== Rotate Selected Marker =====

export function rotateSelectedMarker(degrees) {
    const markers = get('markers');
    const selected = markers.find(function (m) { return m._selected; });
    if (!selected) {
        showToast('No symbol selected');
        return;
    }

    const info = selected._sittemp;
    // Only rotate equipment, unit, and enemy_unit symbols
    if (info.type !== 'equipment' && info.type !== 'unit' && info.type !== 'enemy_unit') {
        showToast('Rotation applies to equipment and unit symbols');
        return;
    }

    // Update rotation (wrap around 360)
    const currentRotation = info.rotation || 0;
    info.rotation = (currentRotation + degrees + 360) % 360;

    // Rebuild the SVG icon with the new rotation
    const sw = info.strokeWidth || 2;
    var svgBase;
    if (info.type === 'equipment') {
        svgBase = equipmentSVG(info.key, info.color, sw);
    } else if (info.type === 'enemy_unit') {
        svgBase = enemyUnitSVG(info.key, info.color, sw);
    } else {
        svgBase = unitSVG(info.key, info.color, sw);
    }
    const ech = info.echelon || 'none';
    const fullSVG = buildSymbolWithLabels(svgBase, info.leftText, info.rightText, info.color, info.rotation, ech);
    const scale = info.symbolScale || 1.0;
    const echelonH = (ech !== 'none') ? 14 : 0;
    const h = 50 + echelonH;
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(fullSVG);

    selected.setIcon({
        url: iconUrl,
        scaledSize: new google.maps.Size(150 * scale, h * scale),
        anchor: new google.maps.Point(75 * scale, (h / 2) * scale)
    });

    showToast('Rotated to ' + info.rotation + '°');
    pushUndoState();
}

// ===== Undo / Redo =====

export function pushUndoState() {
    const draw = get('draw');
    const markers = get('markers');
    const undoStack = get('undoStack');
    const redoStack = get('redoStack');

    const snapshot = {
        features: draw ? draw.getSnapshot().filter(function (f) {
            // Exclude Terra Draw's internal selection/midpoint markers.
            // Check both the documented property names and geometry type as a fallback
            // so this remains correct if internal property names change in future versions.
            if (f.properties.selectionPoint || f.properties.midPoint) return false;
            if (f.properties.mode === 'select') return false;
            // Internal point markers used by select mode are always Point geometry
            // with a 'selectionPoint' or 'midPoint' flag — exclude any unrecognised
            // Point features that have no meaningful mode property either.
            return true;
        }).map(function (f) {
            const props = Object.assign({}, f.properties);
            delete props.selected;
            return Object.assign({}, f, { properties: props });
        }) : [],
        markers: markers.map(function (m) {
            return {
                position: { lat: m.getPosition().lat(), lng: m.getPosition().lng() },
                sittemp: m._sittemp,
            };
        }),
        featureLineTypes: Object.assign({}, get('featureLineTypes'))
    };

    undoStack.push(JSON.stringify(snapshot));
    redoStack.length = 0;

    if (undoStack.length > MAX_UNDO_STATES) undoStack.shift();
}

export function performUndo() {
    const undoStack = get('undoStack');
    const redoStack = get('redoStack');

    if (undoStack.length < 2) {
        showToast('Nothing to undo');
        return;
    }
    redoStack.push(undoStack.pop());
    restoreState(undoStack[undoStack.length - 1]);
    showToast('Undo');
}

export function performRedo() {
    const undoStack = get('undoStack');
    const redoStack = get('redoStack');

    if (redoStack.length === 0) {
        showToast('Nothing to redo');
        return;
    }
    const next = redoStack.pop();
    undoStack.push(next);
    restoreState(next);
    showToast('Redo');
}

function restoreState(stateJson) {
    const saved = JSON.parse(stateJson);
    const draw = get('draw');
    const markers = get('markers');
    const lineOverlays = get('lineOverlays');
    const featureLineTypes = get('featureLineTypes');

    // Clear line overlays
    for (const id of Object.keys(lineOverlays)) {
        lineOverlays[id].setMap(null);
        delete lineOverlays[id];
    }

    // Restore feature line types
    for (const id of Object.keys(featureLineTypes)) {
        delete featureLineTypes[id];
    }
    if (saved.featureLineTypes) {
        Object.assign(featureLineTypes, saved.featureLineTypes);
    }

    // Restore Terra Draw features
    if (draw && get('ready')) {
        draw.clear();
        if (saved.features.length > 0) {
            try { draw.addFeatures(saved.features); } catch (e) { /* ignore */ }
        }
    }

    // Re-apply line type overlays for restored features
    const map = get('map');
    if (saved.featureLineTypes) {
        for (const [fId, lt] of Object.entries(saved.featureLineTypes)) {
            if (lt === 'solid') continue;
            try {
                const feature = draw.getSnapshotFeature(fId);
                if (feature && feature.geometry.type === 'LineString') {
                    const path = feature.geometry.coordinates.map(function (c) { return { lat: c[1], lng: c[0] }; });
                    const color = get('lineColor');
                    const polyline = createLineOverlay(path, lt, color, map);
                    if (polyline) {
                        lineOverlays[fId] = polyline;
                    }
                }
            } catch (e) { /* feature may not exist */ }
        }
    }

    // Restore markers
    markers.forEach(function (m) { m.setMap(null); });
    markers.length = 0;

    saved.markers.forEach(function (data) {
        recreateMarker(data);
    });
}

function recreateMarker(data) {
    const info = data.sittemp;
    let svgString, size, anchor;
    const scale = info.symbolScale || 1.0;

    if (info.type === 'equipment') {
        const sw = info.strokeWidth || 2;
        const rot = info.rotation || 0;
        const ech = info.echelon || 'none';
        const echelonH = (ech !== 'none') ? 14 : 0;
        const h = 50 + echelonH;
        svgString = buildSymbolWithLabels(equipmentSVG(info.key, info.color, sw), info.leftText, info.rightText, info.color, rot, ech);
        size = new google.maps.Size(150 * scale, h * scale);
        anchor = new google.maps.Point(75 * scale, (h / 2) * scale);
    } else if (info.type === 'unit') {
        const sw = info.strokeWidth || 2;
        const rot = info.rotation || 0;
        const ech = info.echelon || 'none';
        const echelonH = (ech !== 'none') ? 14 : 0;
        const h = 50 + echelonH;
        svgString = buildSymbolWithLabels(unitSVG(info.key, info.color, sw), info.leftText, info.rightText, info.color, rot, ech);
        size = new google.maps.Size(150 * scale, h * scale);
        anchor = new google.maps.Point(75 * scale, (h / 2) * scale);
    } else if (info.type === 'enemy_unit') {
        const sw = info.strokeWidth || 2;
        const rot = info.rotation || 0;
        const ech = info.echelon || 'none';
        const echelonH = (ech !== 'none') ? 14 : 0;
        const h = 50 + echelonH;
        svgString = buildSymbolWithLabels(enemyUnitSVG(info.key, info.color, sw), info.leftText, info.rightText, info.color, rot, ech);
        size = new google.maps.Size(150 * scale, h * scale);
        anchor = new google.maps.Point(75 * scale, (h / 2) * scale);
    } else if (info.type === 'star') {
        const fill = info.fill || info.color;
        const opacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"
                fill="${fill}" fill-opacity="${opacity}" stroke="${info.color}" stroke-width="2"/>
        </svg>`;
        size = new google.maps.Size(30 * scale, 30 * scale);
        anchor = new google.maps.Point(15 * scale, 15 * scale);
    } else if (info.type === 'triangle') {
        const fill = info.fill || info.color;
        const opacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,2 28,28 2,28"
                fill="${fill}" fill-opacity="${opacity}" stroke="${info.color}" stroke-width="2"/>
        </svg>`;
        size = new google.maps.Size(30 * scale, 30 * scale);
        anchor = new google.maps.Point(15 * scale, 15 * scale);
    } else if (info.type === 'text') {
        const fs = info.fontSize !== undefined ? info.fontSize : 14;
        const fb = info.fontBold !== undefined ? info.fontBold : true;
        const fi = info.fontItalic !== undefined ? info.fontItalic : false;
        const fu = info.fontUnderline !== undefined ? info.fontUnderline : false;
        const fst = info.fontStrikethrough !== undefined ? info.fontStrikethrough : false;
        const result = buildTextSVG(info.text, info.color, fs, fb, fi, fu, fst);
        svgString = result.svg;
        size = new google.maps.Size(result.width, result.height);
        anchor = new google.maps.Point(result.width / 2, result.height / 2);
    } else {
        return;
    }

    createMapMarker(data.position, svgString, size, anchor, info);
}

// ===== Line Type Styling =====

/**
 * Create a Google Maps Polyline overlay for a given line type.
 * Returns null for 'solid' (no overlay needed).
 */
// Legacy mapping for old saved data
const LEGACY_LINE_TYPE_MAP = {
    'minebelt': 'at_mine',
    'wire': 'single_concertina',
    'tankditch': 'atditch_a',
    'atditch_b': 'atditch_a',
    'flot_b': 'flot_a',
    'triple_concertina': 'arrow',
    'obstacle_belt': 'arrow',
};

function createLineOverlay(path, lineType, color, map, strokeWidth) {
    // Map legacy types to new equivalents
    const resolvedType = LEGACY_LINE_TYPE_MAP[lineType] || lineType;
    let polyline = null;
    const sw = strokeWidth || get('symbolStrokeWidth') || 2;

    switch (resolvedType) {
        case 'dashed':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: sw, scale: 3 }, offset: '0', repeat: '15px' }],
                map
            });
            break;
        case 'dotted':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [{ icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: Math.max(1, sw * 0.7) }, offset: '0', repeat: '10px' }],
                map
            });
            break;
        case 'dashdot':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [
                    { icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: sw, scale: 3 }, offset: '0', repeat: '25px' },
                    { icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: Math.max(1, sw * 0.7) }, offset: '18px', repeat: '25px' }
                ],
                map
            });
            break;
        case 'flot_a':
            // FLOT A — rightward-bulging arc, no base line (matches original SVG)
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [{
                    icon: {
                        path: 'M 0,-6 L 2,-5 L 4,-3 L 5,0 L 4,3 L 2,5 L 0,6',
                        strokeOpacity: 1, strokeColor: color, strokeWeight: sw,
                        fillOpacity: 0, scale: 2
                    },
                    offset: '0', repeat: '28px'
                }],
                map
            });
            break;
        case 'low_wire':
            // Low Wire Fence — base line + picket diagonals (V shape, matches original SVG)
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 1, strokeWeight: sw,
                icons: [{
                    icon: {
                        path: 'M -4,0 L 0,-5 M -4,-5 L 0,0',
                        strokeOpacity: 1, strokeColor: color, strokeWeight: sw,
                        scale: 1.5
                    },
                    offset: '0', repeat: '20px'
                }],
                map
            });
            break;
        case 'single_concertina':
            // Single Concertina — overlapping coil circles, no visible base line
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: 0,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillOpacity: 0, strokeOpacity: 1, strokeColor: color, strokeWeight: sw, scale: 6,
                        anchor: new google.maps.Point(0, 3)
                    },
                    offset: '0', repeat: '10px'
                }],
                map
            });
            break;
        case 'arrow':
            // Arrow — solid line with arrowhead at the end
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 1, strokeWeight: sw,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        fillOpacity: 1, fillColor: color,
                        strokeOpacity: 1, strokeColor: color, strokeWeight: 1, scale: Math.max(3, sw * 1.5)
                    },
                    offset: '100%'
                }],
                map
            });
            break;
        case 'atditch_a':
            // AT Ditch — rightward-pointing filled triangle, no visible base line
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [{
                    icon: {
                        path: 'M 0,-5 L 7,0 L 0,5 Z',
                        fillOpacity: 1, fillColor: color,
                        strokeOpacity: 1, strokeColor: color, strokeWeight: 1, scale: 2.5
                    },
                    offset: '0', repeat: '20px'
                }],
                map
            });
            break;
        case 'atditch_unfin':
            // Unfinished AT Ditch — rightward-pointing unfilled triangle, no visible base line
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [{
                    icon: {
                        path: 'M 0,-5 L 7,0 L 0,5 Z',
                        fillOpacity: 0,
                        strokeOpacity: 1, strokeColor: color, strokeWeight: sw, scale: 2.5
                    },
                    offset: '0', repeat: '20px'
                }],
                map
            });
            break;
        case 'ap_mine':
            // Antipersonnel Mine — filled circle + chevron diagonals from right
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [
                    // Filled circle
                    {
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillOpacity: 1, fillColor: color,
                            strokeColor: color, strokeWeight: 1, scale: 5
                        },
                        offset: '0', repeat: '28px'
                    },
                    // Chevron — diagonal from right to circle center (upper)
                    {
                        icon: {
                            path: 'M 5,-5 L 0,0',
                            strokeOpacity: 1, strokeColor: color, strokeWeight: 3, scale: 1.5
                        },
                        offset: '0', repeat: '28px'
                    },
                    // Chevron — diagonal from right to circle center (lower)
                    {
                        icon: {
                            path: 'M 5,5 L 0,0',
                            strokeOpacity: 1, strokeColor: color, strokeWeight: 3, scale: 1.5
                        },
                        offset: '0', repeat: '28px'
                    }
                ],
                map
            });
            break;
        case 'at_mine':
            // Anti-tank Mine — filled circle only, no base line
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: sw,
                icons: [
                    // Filled circle
                    {
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillOpacity: 1, fillColor: color,
                            strokeColor: color, strokeWeight: 1, scale: 5
                        },
                        offset: '0', repeat: '28px'
                    }
                ],
                map
            });
            break;
    }

    return polyline;
}

function applyLineType(featureId) {
    const lineType = get('lineType');

    // Store the line type for this feature
    const featureLineTypes = get('featureLineTypes');
    featureLineTypes[featureId] = lineType;

    if (lineType === 'solid') return;

    const draw = get('draw');
    if (!draw) return;

    const feature = draw.getSnapshotFeature(featureId);
    if (!feature || feature.geometry.type !== 'LineString') return;

    const path = feature.geometry.coordinates.map(function (c) { return { lat: c[1], lng: c[0] }; });
    const color = get('lineColor');
    const map = get('map');

    const polyline = createLineOverlay(path, lineType, color, map);
    if (polyline) {
        const overlays = get('lineOverlays');
        overlays[featureId] = polyline;
    }
}

/**
 * Change the line type of the currently selected LineString feature.
 * Called from the toolbar when the user picks a new line type while a line is selected.
 * @param {string} newLineType - The new line type key
 * @returns {boolean} true if a line was updated, false otherwise
 */
export function changeLineType(newLineType) {
    const draw = get('draw');
    const selectedId = get('selectedFeatureId');
    if (!draw || !selectedId) return false;

    let feature;
    try {
        feature = draw.getSnapshotFeature(selectedId);
    } catch (e) {
        return false;
    }
    if (!feature || feature.geometry.type !== 'LineString') return false;

    const overlays = get('lineOverlays');
    const featureLineTypes = get('featureLineTypes');

    // Remove old overlay if present
    if (overlays[selectedId]) {
        overlays[selectedId].setMap(null);
        delete overlays[selectedId];
    }

    // Store the new line type
    featureLineTypes[selectedId] = newLineType;

    // Create new overlay (unless solid)
    if (newLineType !== 'solid') {
        const path = feature.geometry.coordinates.map(function (c) { return { lat: c[1], lng: c[0] }; });
        const color = get('lineColor');
        const map = get('map');
        const polyline = createLineOverlay(path, newLineType, color, map);
        if (polyline) {
            overlays[selectedId] = polyline;
        }
    }

    pushUndoState();
    return true;
}
