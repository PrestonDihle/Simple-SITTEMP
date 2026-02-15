/**
 * Simple SITTEMP - Drawing Module
 *
 * Terra Draw initialization, shape activation, symbol/text/star placement,
 * line-type styling, undo/redo, and draw-style updates.
 */

import { get, set, subscribe, MAX_UNDO_STATES } from './state.js';
import {
    equipmentSVG, unitSVG, EQUIPMENT_LIST, UNIT_LIST,
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
                styles: { lineStringColor: lineColor, lineStringWidth: 3 }
            }),
            new TerraDrawPolygonMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: 2 }
            }),
            new TerraDrawRectangleMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: 2 }
            }),
            new TerraDrawCircleMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: 2 }
            }),
            new TerraDrawFreehandMode({
                styles: { fillColor: fillColor, fillOpacity: fillOpacity, outlineColor: lineColor, outlineWidth: 2 }
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
                    selectedLineStringColor: '#FFFFFF',
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

    try {
        draw.updateModeOptions('polygon', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: 2 } });
        draw.updateModeOptions('rectangle', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: 2 } });
        draw.updateModeOptions('circle', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: 2 } });
        draw.updateModeOptions('freehand', { styles: { fillColor, fillOpacity, outlineColor: lineColor, outlineWidth: 2 } });
        draw.updateModeOptions('linestring', { styles: { lineStringColor: lineColor, lineStringWidth: 3 } });
        draw.updateModeOptions('point', { styles: { pointColor: lineColor, pointWidth: 6, pointOutlineColor: '#000000', pointOutlineWidth: 2 } });
    } catch (e) {
        // Styles may fail if mode not yet ready
    }
}

// Auto-update draw styles when colors change
subscribe(['lineColor', 'fillColor', 'fillOpacity'], updateDrawStyles);

// ===== Shape Activation =====

export function activateShape(key) {
    if (!get('ready')) return;
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

    const name = type === 'equipment'
        ? EQUIPMENT_LIST.find(function (e) { return e.key === key; }).name
        : UNIT_LIST.find(function (u) { return u.key === key; }).name;
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
    function onCancel() { cleanup(); }

    document.getElementById('symbol-text-ok').addEventListener('click', onOk);
    document.getElementById('symbol-text-cancel').addEventListener('click', onCancel);
}

function placeSymbol(latLng, leftText, rightText) {
    const type = get('pendingSymbolType');
    const key = get('pendingSymbolKey');
    if (!type || !key) return;

    const color = get('lineColor');
    const svgString = type === 'equipment' ? equipmentSVG(key, color) : unitSVG(key, color);
    const fullSVG = buildSymbolWithLabels(svgString, leftText, rightText, color);

    const sittemp = { type, key, leftText, rightText, color };
    createMapMarker(latLng, fullSVG, new google.maps.Size(120, 50), new google.maps.Point(60, 25), sittemp);
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

    createMapMarker(latLng, svg, new google.maps.Size(30, 30), new google.maps.Point(15, 15), { type: 'star', color, fill, fillOpacity: opacity });
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

    createMapMarker(latLng, svg, new google.maps.Size(30, 30), new google.maps.Point(15, 15), { type: 'triangle', color, fill, fillOpacity: opacity });
    pushUndoState();
}

// ===== Text Placement =====

export function enterTextPlacement() {
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
    function onCancel() { cleanup(); }
    function onKey(e) {
        if (e.key === 'Enter') onOk();
        if (e.key === 'Escape') onCancel();
    }

    document.getElementById('text-ok').addEventListener('click', onOk);
    document.getElementById('text-cancel').addEventListener('click', onCancel);
    input.addEventListener('keydown', onKey);
}

function placeTextLabel(latLng, text) {
    const color = get('lineColor');
    const fontSize = 14;
    const padding = 4;
    const charWidth = 8;
    const width = text.length * charWidth + padding * 2;
    const height = fontSize + padding * 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="white" fill-opacity="0.7" rx="2"/>
        <text x="${padding}" y="${fontSize + padding - 2}" fill="${color}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold">${escapeXml(text)}</text>
    </svg>`;

    createMapMarker(latLng, svg, new google.maps.Size(width, height), new google.maps.Point(width / 2, height / 2), { type: 'text', text, color });
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
        zIndex: 100,
    });

    marker._sittemp = sittempData;
    marker.addListener('click', function () {
        get('markers').forEach(function (m) { m._selected = false; });
        marker._selected = true;
        showToast('Selected. Press Clear Selected to delete.');
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

// ===== Undo / Redo =====

function pushUndoState() {
    const draw = get('draw');
    const markers = get('markers');
    const undoStack = get('undoStack');
    const redoStack = get('redoStack');

    const snapshot = {
        features: draw ? draw.getSnapshot().filter(function (f) {
            return !f.properties.selectionPoint && !f.properties.midPoint;
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
        })
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

    // Clear line overlays
    for (const id of Object.keys(lineOverlays)) {
        lineOverlays[id].setMap(null);
        delete lineOverlays[id];
    }

    // Restore Terra Draw features
    if (draw && get('ready')) {
        draw.clear();
        if (saved.features.length > 0) {
            try { draw.addFeatures(saved.features); } catch (e) { /* ignore */ }
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

    if (info.type === 'equipment') {
        svgString = buildSymbolWithLabels(equipmentSVG(info.key, info.color), info.leftText, info.rightText, info.color);
        size = new google.maps.Size(120, 50);
        anchor = new google.maps.Point(60, 25);
    } else if (info.type === 'unit') {
        svgString = buildSymbolWithLabels(unitSVG(info.key, info.color), info.leftText, info.rightText, info.color);
        size = new google.maps.Size(120, 50);
        anchor = new google.maps.Point(60, 25);
    } else if (info.type === 'star') {
        const fill = info.fill || info.color;
        const opacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"
                fill="${fill}" fill-opacity="${opacity}" stroke="${info.color}" stroke-width="2"/>
        </svg>`;
        size = new google.maps.Size(30, 30);
        anchor = new google.maps.Point(15, 15);
    } else if (info.type === 'triangle') {
        const fill = info.fill || info.color;
        const opacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
            <polygon points="15,2 28,28 2,28"
                fill="${fill}" fill-opacity="${opacity}" stroke="${info.color}" stroke-width="2"/>
        </svg>`;
        size = new google.maps.Size(30, 30);
        anchor = new google.maps.Point(15, 15);
    } else if (info.type === 'text') {
        const text = info.text;
        const fontSize = 14, padding = 4, charWidth = 8;
        const w = text.length * charWidth + padding * 2;
        const h = fontSize + padding * 2;
        svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
            <rect x="0" y="0" width="${w}" height="${h}" fill="white" fill-opacity="0.7" rx="2"/>
            <text x="${padding}" y="${fontSize + padding - 2}" fill="${info.color}" font-size="${fontSize}" font-family="Arial,sans-serif" font-weight="bold">${escapeXml(text)}</text>
        </svg>`;
        size = new google.maps.Size(w, h);
        anchor = new google.maps.Point(w / 2, h / 2);
    } else {
        return;
    }

    createMapMarker(data.position, svgString, size, anchor, info);
}

// ===== Line Type Styling =====

function applyLineType(featureId) {
    const lineType = get('lineType');
    if (lineType === 'solid') return;

    const draw = get('draw');
    if (!draw) return;

    const feature = draw.getSnapshotFeature(featureId);
    if (!feature || feature.geometry.type !== 'LineString') return;

    const path = feature.geometry.coordinates.map(function (c) { return { lat: c[1], lng: c[0] }; });
    const color = get('lineColor');
    const map = get('map');
    let polyline;

    switch (lineType) {
        case 'dashed':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: 3,
                icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: 3, scale: 3 }, offset: '0', repeat: '15px' }],
                map
            });
            break;
        case 'dotted':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: 3,
                icons: [{ icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: 2 }, offset: '0', repeat: '10px' }],
                map
            });
            break;
        case 'dashdot':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: 3,
                icons: [
                    { icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeWeight: 3, scale: 3 }, offset: '0', repeat: '25px' },
                    { icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeOpacity: 0, scale: 2 }, offset: '18px', repeat: '25px' }
                ],
                map
            });
            break;
        case 'minebelt':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 1, strokeWeight: 2,
                icons: [{ icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 1, fillColor: color, strokeColor: color, strokeWeight: 1, scale: 4 }, offset: '0', repeat: '20px' }],
                map
            });
            break;
        case 'wire':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 1, strokeWeight: 2,
                icons: [{ icon: { path: google.maps.SymbolPath.CIRCLE, fillOpacity: 0, strokeColor: color, strokeWeight: 1.5, scale: 4 }, offset: '0', repeat: '18px' }],
                map
            });
            break;
        case 'tankditch':
            polyline = new google.maps.Polyline({
                path, strokeColor: color, strokeOpacity: 0, strokeWeight: 3,
                icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, fillOpacity: 1, fillColor: color, strokeColor: color, strokeWeight: 1, scale: 3 }, offset: '0', repeat: '14px' }],
                map
            });
            break;
    }

    if (polyline) {
        const overlays = get('lineOverlays');
        overlays[featureId] = polyline;
    }
}
