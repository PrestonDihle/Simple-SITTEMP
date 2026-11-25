/**
 * Simple SITTEMP - Drawing Module
 *
 * Terra Draw initialization, shape activation, symbol/text/star placement,
 * line-type styling, undo/redo, and draw-style updates.
 */

import { get, set, subscribe, MAX_UNDO_STATES, SYMBOL_MAX_SCALE, TASK_MAX_SCALE } from './state.js';
import {
    equipmentSVG, unitSVG, enemyUnitSVG, tacticalTaskSVG,
    EQUIPMENT_LIST, UNIT_LIST, ENEMY_UNIT_LIST, TACTICAL_TASK_LIST,
    buildSymbolWithLabels, escapeXml, LINE_TYPES, LINE_TYPE_COLORS, getLinePreviewSVG
} from './symbols.js';
import { showToast } from './toolbar.js';
import { syncViewshed, clearViewshedOverlays, buildViewshedSection } from './viewshed.js';
import { shadeFeature, getShadeConfigs, restoreShades } from './elevation.js';
import { buildMeasureSection, syncMeasureLabel, syncAllMeasureLabels, forgetMeasure } from './measures.js';
import { enterRoutePlacement, exitRoutePlacement, getRouteConfigs, restoreRoutes } from './routes.js';
import { getContourConfigs, restoreContours } from './contours.js';

// ===== Per-Feature Style Helper Functions =====
// These are passed as function-based styles to Terra Draw so each feature
// can have its own color/opacity/stroke overrides (stored in featureStyles).

function _featureFillColor(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    var fc = (s && s.fillColor !== undefined) ? s.fillColor : get('fillColor');
    return (fc === 'none') ? '#000000' : (fc || '#000000');
}
function _featureFillOpacity(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    var fc = (s && s.fillColor !== undefined) ? s.fillColor : get('fillColor');
    if (fc === 'none') return 0;
    return (s && s.fillOpacity !== undefined) ? s.fillOpacity : get('fillOpacity');
}
function _featureOutlineColor(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    return (s && s.lineColor) ? s.lineColor : get('lineColor');
}
function _featureOutlineWidth(feature) {
    // A patterned line type draws its own outline overlay, so hide the base outline
    var lt = get('featureLineTypes')[feature.id];
    if (lt && lt !== 'solid') return 0;
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    return (s && s.strokeWidth) ? s.strokeWidth : (get('symbolStrokeWidth') || 2);
}
function _featureLineColor(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    return (s && s.lineColor) ? s.lineColor : get('lineColor');
}
function _featureLineWidth(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    return (s && s.strokeWidth) ? s.strokeWidth : (get('symbolStrokeWidth') || 2);
}
function _featureLineOpacity(feature) {
    var flt = get('featureLineTypes'); var lt = flt[feature.id];
    return (lt && lt !== 'solid') ? 0 : 1;
}

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
                    lineStringColor: _featureLineColor,
                    lineStringWidth: _featureLineWidth,
                    lineStringOpacity: _featureLineOpacity
                }
            }),
            new TerraDrawPolygonMode({
                styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth }
            }),
            new TerraDrawRectangleMode({
                styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth }
            }),
            new TerraDrawCircleMode({
                styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth }
            }),
            new TerraDrawFreehandMode({
                styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth }
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

    draw.on('select', function (id) {
        // Mutual exclusion: deselect any selected marker
        get('markers').forEach(function (m) {
            if (m._selected) {
                m._selected = false;
                rebuildMarkerIcon(m);
            }
        });
        set('selectedFeatureId', id);
        _syncPanelToFeature(id);
        _showPopoverForFeature(id);
    });

    draw.on('deselect', function () {
        set('selectedFeatureId', null);
        set('selectionInfo', null);
        _hidePopover();
    });

    draw.on('finish', function (id, context) {
        if (context.action === 'draw') {
            pushUndoState();
            applyLineType(id);
        }
    });

    draw.on('change', function (ids, type) {
        if (type === 'delete') {
            ids.forEach(forgetMeasure);
            pushUndoState();
        }

        // Keep control-measure labels on their shapes
        if (type === 'update') {
            var measures = get('featureMeasures');
            ids.forEach(function (id) { if (measures[id]) syncMeasureLabel(id); });
        }

        // Sync line-type overlays when features are updated (dragged/edited)
        if (type === 'update') {
            var overlays = get('lineOverlays');
            ids.forEach(function (id) {
                if (overlays[id]) {
                    try {
                        var path = _overlayPath(draw.getSnapshotFeature(id));
                        if (path) overlays[id].setPath(path);
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

    try {
        // Use per-feature style functions so individual feature colors persist
        draw.updateModeOptions('polygon', { styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth } });
        draw.updateModeOptions('rectangle', { styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth } });
        draw.updateModeOptions('circle', { styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth } });
        draw.updateModeOptions('freehand', { styles: { fillColor: _featureFillColor, fillOpacity: _featureFillOpacity, outlineColor: _featureOutlineColor, outlineWidth: _featureOutlineWidth } });
        draw.updateModeOptions('linestring', { styles: {
            lineStringColor: _featureLineColor, lineStringWidth: _featureLineWidth,
            lineStringOpacity: _featureLineOpacity
        } });
        draw.updateModeOptions('point', { styles: { pointColor: get('lineColor'), pointWidth: 6, pointOutlineColor: '#000000', pointOutlineWidth: 2 } });
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
    exitRoutePlacement();
    const draw = get('draw');

    if (key === 'flight_route') {
        enterRoutePlacement();
    } else if (key === 'triangle') {
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
    exitRoutePlacement();
    set('pendingSymbolType', type);
    set('pendingSymbolKey', key);

    const draw = get('draw');
    if (get('ready')) draw.setMode('select');

    var found;
    if (type === 'equipment') {
        found = EQUIPMENT_LIST.find(function (e) { return e.key === key; });
    } else if (type === 'enemy_unit') {
        found = ENEMY_UNIT_LIST.find(function (u) { return u.key === key; });
    } else if (type === 'tactical_task') {
        found = TACTICAL_TASK_LIST.find(function (t) { return t.key === key; });
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
    } else if (type === 'tactical_task') {
        svgString = tacticalTaskSVG(key, color, strokeWidth);
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
        // Mutual exclusion: clear any active Terra Draw selection
        if (get('selectedFeatureId')) {
            var draw = get('draw');
            if (draw && get('ready')) {
                try { draw.setMode('select'); } catch (e) { /* ignore */ }
            }
            set('selectedFeatureId', null);
        }

        // Deselect all other markers and remove their highlights
        get('markers').forEach(function (m) {
            if (m._selected) {
                m._selected = false;
                rebuildMarkerIcon(m);
            }
        });

        // Select this marker with highlight
        marker._selected = true;
        rebuildMarkerIcon(marker);

        // Sync font state when selecting a text marker
        if (marker._sittemp && marker._sittemp.type === 'text') {
            var info = marker._sittemp;
            set('fontSize', info.fontSize !== undefined ? info.fontSize : 14);
            set('fontBold', info.fontBold !== undefined ? info.fontBold : true);
            set('fontItalic', info.fontItalic !== undefined ? info.fontItalic : false);
            set('fontUnderline', info.fontUnderline !== undefined ? info.fontUnderline : false);
            set('fontStrikethrough', info.fontStrikethrough !== undefined ? info.fontStrikethrough : false);
        }

        // Sync style panel to this marker's current values
        _syncPanelToMarker(marker);

        // Show action popover
        _showPopoverForMarker(marker);

        if (marker._sittemp && (marker._sittemp.type === 'equipment' || marker._sittemp.type === 'unit' || marker._sittemp.type === 'enemy_unit' || marker._sittemp.type === 'tactical_task')) {
            showToast('Selected. R / Shift+R to rotate.');
        } else {
            showToast('Selected.');
        }
    });

    markers.push(marker);
    // markers array is mutated in-place, no need to set() again

    // Draw the attached viewshed, if any (e.g. when restored by undo/redo)
    syncViewshed(marker);
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
            const featureStyles = get('featureStyles');
            if (featureStyles[selectedId]) delete featureStyles[selectedId];
            set('selectedFeatureId', null);
            set('selectionInfo', null);
            deleted = true;
        } catch (e) { /* ignore */ }
    }

    const markers = get('markers');
    const remaining = markers.filter(function (m) {
        if (m._selected) {
            clearViewshedOverlays(m);
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
        set('selectionInfo', null);
        _hidePopover();
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
    if (!isRotatable(info.type)) {
        showToast('Rotation applies to equipment, unit and tactical task symbols');
        return;
    }

    // Update rotation (wrap around 360)
    const currentRotation = info.rotation || 0;
    info.rotation = (currentRotation + degrees + 360) % 360;

    // An attached viewshed turns with its symbol (both measured clockwise)
    if (info.viewshed) {
        info.viewshed.azimuth = ((((+info.viewshed.azimuth || 0) + degrees) % 360) + 360) % 360;
        syncViewshed(selected);
    }

    rebuildMarkerIcon(selected);   // keeps the selection highlight
    showToast('Rotated to ' + info.rotation + '°');
    pushUndoState();
}

/** Symbol types that can be rotated with R / Shift+R or the popover buttons. */
export function isRotatable(type) {
    return type === 'equipment' || type === 'unit' || type === 'enemy_unit' || type === 'tactical_task';
}

// ===== Live Style Editing =====

/**
 * Rebuild a marker's SVG icon from its _sittemp metadata.
 * Adds a dashed selection border when marker._selected is true.
 */
export function rebuildMarkerIcon(marker) {
    var info = marker._sittemp;
    if (!info) return;
    var scale = info.symbolScale || 1.0;
    var svgString, size, anchor;

    if (info.type === 'equipment' || info.type === 'unit' || info.type === 'enemy_unit' || info.type === 'tactical_task') {
        var sw = info.strokeWidth || 2;
        var rot = info.rotation || 0;
        var ech = info.echelon || 'none';
        var echelonH = (ech !== 'none') ? 14 : 0;
        var h = 50 + echelonH;
        var svgBase;
        if (info.type === 'equipment') svgBase = equipmentSVG(info.key, info.color, sw);
        else if (info.type === 'enemy_unit') svgBase = enemyUnitSVG(info.key, info.color, sw);
        else if (info.type === 'tactical_task') svgBase = tacticalTaskSVG(info.key, info.color, sw);
        else svgBase = unitSVG(info.key, info.color, sw);
        svgString = buildSymbolWithLabels(svgBase, info.leftText, info.rightText, info.color, rot, ech);
        if (marker._selected) svgString = _addSelectionHighlight(svgString, 150, h, info.color);
        size = new google.maps.Size(150 * scale, h * scale);
        anchor = new google.maps.Point(75 * scale, (h / 2) * scale);
    } else if (info.type === 'star') {
        var svgFill = info.fill || info.color;
        var svgOpacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">'
            + '<polygon points="15,1 18.5,11 29,11 20.5,17.5 23.5,28 15,22 6.5,28 9.5,17.5 1,11 11.5,11"'
            + ' fill="' + svgFill + '" fill-opacity="' + svgOpacity + '" stroke="' + info.color + '" stroke-width="2"/>'
            + (marker._selected ? '<rect x="1" y="1" width="28" height="28" fill="none" stroke="' + info.color + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>' : '')
            + '</svg>';
        size = new google.maps.Size(30 * scale, 30 * scale);
        anchor = new google.maps.Point(15 * scale, 15 * scale);
    } else if (info.type === 'triangle') {
        var triFill = info.fill || info.color;
        var triOpacity = info.fillOpacity !== undefined ? info.fillOpacity : 0.6;
        svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">'
            + '<polygon points="15,2 28,28 2,28"'
            + ' fill="' + triFill + '" fill-opacity="' + triOpacity + '" stroke="' + info.color + '" stroke-width="2"/>'
            + (marker._selected ? '<rect x="1" y="1" width="28" height="28" fill="none" stroke="' + info.color + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>' : '')
            + '</svg>';
        size = new google.maps.Size(30 * scale, 30 * scale);
        anchor = new google.maps.Point(15 * scale, 15 * scale);
    } else if (info.type === 'text') {
        var fs = info.fontSize !== undefined ? info.fontSize : 14;
        var fb = info.fontBold !== undefined ? info.fontBold : true;
        var fi = info.fontItalic !== undefined ? info.fontItalic : false;
        var fu = info.fontUnderline !== undefined ? info.fontUnderline : false;
        var fst = info.fontStrikethrough !== undefined ? info.fontStrikethrough : false;
        var result = buildTextSVG(info.text, info.color, fs, fb, fi, fu, fst);
        svgString = marker._selected ? _addSelectionHighlight(result.svg, result.width, result.height, info.color) : result.svg;
        size = new google.maps.Size(result.width, result.height);
        anchor = new google.maps.Point(result.width / 2, result.height / 2);
    } else {
        return;
    }

    var iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);
    marker.setIcon({ url: iconUrl, scaledSize: size, anchor: anchor });
}

function _addSelectionHighlight(svgString, w, h, color) {
    var rect = '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2)
        + '" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>';
    return svgString.replace('</svg>', rect + '</svg>');
}

/**
 * Apply a style property to the currently selected object (Terra Draw feature or marker).
 * Valid props: 'lineColor', 'fillColor', 'fillOpacity', 'strokeWidth', 'symbolScale'
 */
export function applyStyleToSelected(prop, value) {
    var selectedId = get('selectedFeatureId');
    if (selectedId) {
        _applyStyleToFeature(selectedId, prop, value);
        return;
    }
    var markers = get('markers');
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]._selected) {
            _applyStyleToMarker(markers[i], prop, value);
            return;
        }
    }
}

function _applyStyleToFeature(featureId, prop, value) {
    var featureStyles = get('featureStyles');
    if (!featureStyles[featureId]) featureStyles[featureId] = {};
    featureStyles[featureId][prop] = value;
    updateDrawStyles(); // triggers re-render of all features using the updated function
    if (prop === 'lineColor') syncMeasureLabel(featureId); // label follows the outline color
    if (prop === 'lineColor' || prop === 'strokeWidth') _rebuildLineOverlay(featureId); // pattern follows color/width
    _scheduleUndoPush();
}

function _applyStyleToMarker(marker, prop, value) {
    var info = marker._sittemp;
    if (prop === 'lineColor') { info.color = value; }
    else if (prop === 'fillColor') { info.fill = value; }
    else if (prop === 'fillOpacity') { info.fillOpacity = parseFloat(value); }
    else if (prop === 'strokeWidth') { info.strokeWidth = parseInt(value, 10); }
    else if (prop === 'symbolScale') { info.symbolScale = parseFloat(value); }
    rebuildMarkerIcon(marker);
    _scheduleUndoPush();
}

var _undoPushTimer = null;
function _scheduleUndoPush() {
    if (_undoPushTimer) clearTimeout(_undoPushTimer);
    _undoPushTimer = setTimeout(function () {
        _undoPushTimer = null;
        pushUndoState();
    }, 300);
}

// ===== Selection → Panel Sync =====

function _syncPanelToMarker(marker) {
    var info = marker._sittemp;
    var fillColor = (info.fill !== undefined) ? info.fill : 'none';
    // For stroke-only symbols (equipment/unit/enemy/tactical), there's no fill concept
    var hasNoFill = (info.type === 'equipment' || info.type === 'unit' || info.type === 'enemy_unit' || info.type === 'tactical_task');
    set('selectionInfo', {
        type: info.type,
        label: _typeLabel(info.type),
        lineColor: info.color || get('lineColor'),
        fillColor: hasNoFill ? null : fillColor,
        fillOpacity: info.fillOpacity !== undefined ? info.fillOpacity : get('fillOpacity'),
        strokeWidth: info.strokeWidth || get('symbolStrokeWidth'),
        symbolScale: info.symbolScale || get('symbolScale')
    });
}

function _syncPanelToFeature(featureId) {
    var featureStyles = get('featureStyles');
    var s = featureStyles[featureId] || {};
    var draw = get('draw');
    var featureType = 'shape';
    try {
        var feat = draw.getSnapshotFeature(featureId);
        if (feat && feat.properties && feat.properties.mode) featureType = feat.properties.mode;
        else if (feat) featureType = (feat.geometry.type || 'shape').toLowerCase();
    } catch (e) { /* ignore */ }
    set('selectionInfo', {
        type: featureType,
        label: _typeLabel(featureType),
        lineColor: s.lineColor || get('lineColor'),
        fillColor: (s.fillColor !== undefined) ? s.fillColor : get('fillColor'),
        fillOpacity: (s.fillOpacity !== undefined) ? s.fillOpacity : get('fillOpacity'),
        strokeWidth: s.strokeWidth || get('symbolStrokeWidth'),
        symbolScale: null // not applicable for shapes
    });
}

function _typeLabel(type) {
    var labels = {
        equipment: 'Equipment', unit: 'Unit', enemy_unit: 'Enemy Unit',
        tactical_task: 'Tactical Task', star: 'Star', triangle: 'Triangle',
        text: 'Text', polygon: 'Polygon', linestring: 'Line',
        rectangle: 'Rectangle', circle: 'Circle', freehand: 'Freehand'
    };
    return labels[type] || type || 'Object';
}

// ===== Object Popover (Req 4) =====

var _overlayView = null;
var _overlayProjection = null;
var _popoverMapClickListener = null;
var _popoverEscHandler = null;

function _ensureOverlay() {
    if (_overlayProjection) return _overlayProjection;
    if (!_overlayView) {
        var map = get('map');
        if (!map) return null;
        _overlayView = new google.maps.OverlayView();
        _overlayView.draw = function () {
            if (!_overlayProjection) {
                _overlayProjection = _overlayView.getProjection();
            }
        };
        _overlayView.setMap(map);
    }
    return _overlayProjection;
}

function _latLngToPixel(latLng) {
    var proj = _ensureOverlay();
    if (proj) {
        var px = proj.fromLatLngToContainerPixel(latLng);
        if (px) return { x: px.x, y: px.y };
    }
    // Fallback: use map.getProjection() + fromLatLngToPoint math
    var map = get('map');
    var mproj = map.getProjection();
    if (!mproj) return null;
    var bounds = map.getBounds();
    if (!bounds) return null;
    var scale = Math.pow(2, map.getZoom());
    var nw = mproj.fromLatLngToPoint(new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng()));
    var pt = mproj.fromLatLngToPoint(latLng);
    return { x: Math.floor((pt.x - nw.x) * scale), y: Math.floor((pt.y - nw.y) * scale) };
}

function _getFeatureCentroid(featureId) {
    var draw = get('draw');
    if (!draw) return null;
    var features = draw.getSnapshot();
    var feat = null;
    for (var i = 0; i < features.length; i++) {
        if (features[i].id === featureId) { feat = features[i]; break; }
    }
    if (!feat) return null;
    var coords = feat.geometry.coordinates;
    var geomType = feat.geometry.type;
    if (geomType === 'Point') {
        return new google.maps.LatLng(coords[1], coords[0]);
    }
    if (geomType === 'LineString') {
        var mid = Math.floor(coords.length / 2);
        return new google.maps.LatLng(coords[mid][1], coords[mid][0]);
    }
    var ring = (geomType === 'Polygon') ? coords[0] : coords;
    if (!ring || !ring.length) return null;
    var sumLat = 0, sumLng = 0;
    for (var j = 0; j < ring.length; j++) { sumLng += ring[j][0]; sumLat += ring[j][1]; }
    return new google.maps.LatLng(sumLat / ring.length, sumLng / ring.length);
}

var _POPOVER_COLORS = ['#000000', '#FF0000', '#0000FF', '#00AA00', '#FFFFFF', '#808080', '#FF8C00', '#800080'];

function _buildPopoverContent(popover, type, info) {
    popover.innerHTML = '';

    var delBtn = document.createElement('button');
    delBtn.className = 'popover-delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', function () {
        _hidePopover();
        clearSelected();
    });
    popover.appendChild(delBtn);

    var isShape = ['polygon', 'rectangle', 'circle', 'freehand', 'linestring'].indexOf(type) !== -1;
    var hasFill = ['polygon', 'rectangle', 'circle', 'freehand'].indexOf(type) !== -1;
    var isMarker = !isShape;

    var lineColor = info.lineColor || get('lineColor');
    var fillColor = (info.fillColor !== null && info.fillColor !== undefined) ? info.fillColor : get('fillColor');
    var fillOpacity = (info.fillOpacity !== null && info.fillOpacity !== undefined) ? info.fillOpacity : get('fillOpacity');
    var strokeWidth = info.strokeWidth || get('symbolStrokeWidth');
    var symbolScale = (info.symbolScale !== null && info.symbolScale !== undefined) ? info.symbolScale : get('symbolScale');

    function makeColorRow(label, propName, currentVal) {
        var row = document.createElement('div');
        row.className = 'popover-row';
        var lbl = document.createElement('span');
        lbl.className = 'popover-label';
        lbl.textContent = label;
        row.appendChild(lbl);
        var swatches = document.createElement('div');
        swatches.className = 'popover-swatches';

        if (propName === 'fillColor') {
            var noFillSw = document.createElement('div');
            noFillSw.className = 'popover-swatch no-fill' + (currentVal === 'none' ? ' active' : '');
            noFillSw.title = 'No Fill';
            noFillSw.addEventListener('click', function () {
                swatches.querySelectorAll('.popover-swatch').forEach(function (s) { s.classList.remove('active'); });
                noFillSw.classList.add('active');
                set('fillColor', 'none');
                applyStyleToSelected('fillColor', 'none');
            });
            swatches.appendChild(noFillSw);
        }

        _POPOVER_COLORS.forEach(function (c) {
            var sw = document.createElement('div');
            var isActive = (currentVal !== 'none' && c === currentVal);
            sw.className = 'popover-swatch' + (isActive ? ' active' : '');
            sw.style.backgroundColor = c;
            sw.addEventListener('click', function () {
                swatches.querySelectorAll('.popover-swatch').forEach(function (s) { s.classList.remove('active'); });
                sw.classList.add('active');
                set(propName === 'fillColor' ? 'fillColor' : 'lineColor', c);
                applyStyleToSelected(propName, c);
            });
            swatches.appendChild(sw);
        });
        row.appendChild(swatches);
        return row;
    }

    function makeSliderRow(label, propName, min, max, step, currentVal, format) {
        var row = document.createElement('div');
        row.className = 'popover-row';
        var lbl = document.createElement('span');
        lbl.className = 'popover-label';
        lbl.textContent = label;
        row.appendChild(lbl);
        var sl = document.createElement('input');
        sl.type = 'range'; sl.className = 'popover-slider';
        sl.min = min; sl.max = max; sl.step = step; sl.value = currentVal;
        var valSpan = document.createElement('span');
        valSpan.className = 'popover-val';
        valSpan.textContent = format(currentVal);
        sl.addEventListener('input', function () {
            var v = parseFloat(sl.value);
            valSpan.textContent = format(v);
            applyStyleToSelected(propName, v);
        });
        row.appendChild(sl);
        row.appendChild(valSpan);
        return row;
    }

    popover.appendChild(makeColorRow('Line', 'lineColor', lineColor));
    if (hasFill) {
        popover.appendChild(makeColorRow('Fill', 'fillColor', fillColor));
        popover.appendChild(makeSliderRow('Opacity', 'fillOpacity', 0, 1, 0.01, fillOpacity,
            function (v) { return Math.round(v * 100) + '%'; }));
    }
    popover.appendChild(makeSliderRow('Stroke', 'strokeWidth', 1, 10, 1, strokeWidth,
        function (v) { return Math.round(v); }));
    if (isMarker) {
        var maxScale = type === 'tactical_task' ? TASK_MAX_SCALE : SYMBOL_MAX_SCALE;
        popover.appendChild(makeSliderRow('Scale', 'symbolScale', 0.5, maxScale, 0.1, symbolScale,
            function (v) { return parseFloat(v).toFixed(1) + 'x'; }));
    }

    // Rotate buttons (same 15° steps as R / Shift+R)
    if (isRotatable(type)) {
        var rotMarker = get('markers').find(function (m) { return m._selected; });
        if (rotMarker) {
            var rotRow = document.createElement('div');
            rotRow.className = 'popover-row';
            var rotLbl = document.createElement('span');
            rotLbl.className = 'popover-label';
            rotLbl.textContent = 'Rotate';
            var rotVal = document.createElement('span');
            rotVal.className = 'popover-val';
            var showRot = function () { rotVal.textContent = (rotMarker._sittemp.rotation || 0) + '°'; };
            var mkRotBtn = function (txt, deg, title) {
                var b = document.createElement('button');
                b.className = 'popover-rot-btn';
                b.textContent = txt;
                b.title = title;
                // Rebuild the popover so the viewshed Az field shows the new azimuth
                b.addEventListener('click', function () { rotateSelectedMarker(deg); _showPopoverForMarker(rotMarker); });
                return b;
            };
            rotRow.appendChild(rotLbl);
            rotRow.appendChild(mkRotBtn('⟲', -15, 'Rotate 15° counterclockwise (Shift+R)'));
            rotRow.appendChild(mkRotBtn('⟳', 15, 'Rotate 15° clockwise (R)'));
            rotRow.appendChild(rotVal);
            showRot();
            popover.appendChild(rotRow);
        }
    }

    // Line type grid for lines and area shapes (moved here from the Style Panel)
    if (LINE_TYPE_SHAPES.indexOf(type) !== -1 && get('selectedFeatureId')) {
        var ltId = get('selectedFeatureId');
        var current = get('featureLineTypes')[ltId] || 'solid';
        var ltSection = document.createElement('div');
        ltSection.className = 'popover-vs';
        var ltHead = document.createElement('div');
        ltHead.className = 'popover-vs-head';
        ltHead.innerHTML = '<span>Line type</span>';
        ltSection.appendChild(ltHead);
        var ltGrid = document.createElement('div');
        ltGrid.className = 'popover-lt-grid';
        LINE_TYPES.forEach(function (lt) {
            var item = document.createElement('button');
            item.className = 'popover-lt-item' + (lt.key === current ? ' active' : '');
            item.title = lt.name;
            item.innerHTML = '<span class="popover-lt-preview">' + getLinePreviewSVG(lt.key) + '</span><span>' + lt.name + '</span>';
            item.addEventListener('click', function () {
                if (changeLineType(lt.key)) {
                    showToast('Line type: ' + lt.name);
                    _syncPanelToFeature(ltId);
                    _showPopoverForFeature(ltId);   // refresh swatches and the active item
                }
            });
            ltGrid.appendChild(item);
        });
        ltSection.appendChild(ltGrid);
        popover.appendChild(ltSection);
    }

    // Control measure tagging (PZ/LZ/BP..., airspace zones) for area shapes
    if (hasFill && get('selectedFeatureId')) {
        buildMeasureSection(popover, get('selectedFeatureId'), _scheduleUndoPush);
    }

    // Elevation shading for area shapes
    if (hasFill) {
        var featureId = get('selectedFeatureId');
        if (featureId) {
            var shadeBtn = document.createElement('button');
            shadeBtn.className = 'popover-vs-add popover-elev-btn';
            shadeBtn.textContent = 'Shade elevation';
            shadeBtn.title = 'Color this area by elevation bands (uses ~20 Elevation API requests)';
            shadeBtn.addEventListener('click', function () {
                _hidePopover();
                shadeFeature(featureId);
            });
            popover.appendChild(shadeBtn);
        }
    }

    // Viewshed controls for equipment / unit / enemy unit symbols
    if (type === 'equipment' || type === 'unit' || type === 'enemy_unit') {
        var selMarker = get('markers').find(function (m) { return m._selected; });
        if (selMarker) buildViewshedSection(popover, selMarker, _scheduleUndoPush);
    }
}

function _showPopoverAtLatLng(latLng, type, info) {
    var popover = document.getElementById('object-popover');
    if (!popover) return;
    _buildPopoverContent(popover, type, info || {});
    var px = _latLngToPixel(latLng);
    if (px) {
        popover.style.left = Math.round(px.x) + 'px';
        popover.style.top = Math.round(px.y) + 'px';
    }
    popover.style.display = 'block';

    // Close on map pan/zoom
    var map = get('map');
    if (!_popoverMapClickListener) {
        _popoverMapClickListener = map.addListener('click', function () {
            get('markers').forEach(function (m) {
                if (m._selected) { m._selected = false; rebuildMarkerIcon(m); }
            });
            set('selectionInfo', null);
            _hidePopover();
        });
    }

    // Close on Esc key
    if (_popoverEscHandler) {
        document.removeEventListener('keydown', _popoverEscHandler);
    }
    _popoverEscHandler = function (e) {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', _popoverEscHandler);
            _popoverEscHandler = null;
            get('markers').forEach(function (m) {
                if (m._selected) { m._selected = false; rebuildMarkerIcon(m); }
            });
            set('selectionInfo', null);
            _hidePopover();
        }
    };
    document.addEventListener('keydown', _popoverEscHandler);
}

function _showPopoverForMarker(marker) {
    var info = get('selectionInfo') || {};
    var type = (marker._sittemp && marker._sittemp.type) || 'marker';
    _showPopoverAtLatLng(marker.getPosition(), type, info);
}

function _showPopoverForFeature(featureId) {
    var info = get('selectionInfo') || {};
    var centroid = _getFeatureCentroid(featureId);
    if (!centroid) return;
    var draw = get('draw');
    var features = draw ? draw.getSnapshot() : [];
    var type = 'polygon';
    for (var i = 0; i < features.length; i++) {
        if (features[i].id === featureId) {
            var mode = features[i].properties && features[i].properties.mode;
            type = mode || features[i].geometry.type.toLowerCase();
            break;
        }
    }
    _showPopoverAtLatLng(centroid, type, info);
}

function _hidePopover() {
    var popover = document.getElementById('object-popover');
    if (popover) popover.style.display = 'none';
    if (_popoverMapClickListener) {
        google.maps.event.removeListener(_popoverMapClickListener);
        _popoverMapClickListener = null;
    }
    if (_popoverEscHandler) {
        document.removeEventListener('keydown', _popoverEscHandler);
        _popoverEscHandler = null;
    }
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
        featureLineTypes: Object.assign({}, get('featureLineTypes')),
        featureStyles: Object.assign({}, get('featureStyles')),
        featureMeasures: JSON.parse(JSON.stringify(get('featureMeasures') || {})),
        elevationShades: getShadeConfigs(),
        routes: getRouteConfigs(),
        contours: getContourConfigs()
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

    // Restore per-feature style overrides
    const featureStyles = get('featureStyles');
    for (const id of Object.keys(featureStyles)) {
        delete featureStyles[id];
    }
    if (saved.featureStyles) {
        Object.assign(featureStyles, saved.featureStyles);
    }

    // Restore Terra Draw features
    if (draw && get('ready')) {
        draw.clear();
        if (saved.features.length > 0) {
            try { draw.addFeatures(saved.features); } catch (e) { /* ignore */ }
        }
    }

    // Restore control-measure tags (after draw.clear(), whose delete events drop tags)
    const featureMeasures = get('featureMeasures');
    for (const id of Object.keys(featureMeasures)) delete featureMeasures[id];
    if (saved.featureMeasures) Object.assign(featureMeasures, JSON.parse(JSON.stringify(saved.featureMeasures)));
    syncAllMeasureLabels();

    // Re-apply line type overlays for restored lines and area shapes
    if (saved.featureLineTypes) {
        for (const fId of Object.keys(saved.featureLineTypes)) _rebuildLineOverlay(fId);
    }
    updateDrawStyles();

    // Restore markers
    markers.forEach(function (m) { clearViewshedOverlays(m); m.setMap(null); });
    markers.length = 0;

    saved.markers.forEach(function (data) {
        recreateMarker(data);
    });

    // Restore elevation shading (grids are cached, so this doesn't re-query)
    restoreShades(saved.elevationShades || []);

    // Restore flight routes
    restoreRoutes(saved.routes || []);

    // Restore contour line sets (grids are cached, so this doesn't re-query)
    restoreContours(saved.contours || []);
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
    } else if (info.type === 'tactical_task') {
        const sw = info.strokeWidth || 2;
        const rot = info.rotation || 0;
        const ech = info.echelon || 'none';
        const echelonH = (ech !== 'none') ? 14 : 0;
        const h = 50 + echelonH;
        svgString = buildSymbolWithLabels(tacticalTaskSVG(info.key, info.color, sw), info.leftText, info.rightText, info.color, rot, ech);
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

/** Path a line-type overlay follows: the line itself, or a shape's closed outline. */
function _overlayPath(feature) {
    if (!feature || !feature.geometry) return null;
    var g = feature.geometry;
    var coords = g.type === 'LineString' ? g.coordinates : (g.type === 'Polygon' ? g.coordinates[0] : null);
    if (!coords) return null;
    return coords.map(function (c) { return { lat: c[1], lng: c[0] }; });
}

/** Recreate a feature's line-type overlay from its stored type, color and width. */
function _rebuildLineOverlay(featureId) {
    var overlays = get('lineOverlays');
    if (overlays[featureId]) {
        overlays[featureId].setMap(null);
        delete overlays[featureId];
    }
    var lt = get('featureLineTypes')[featureId];
    if (!lt || lt === 'solid') return;
    var draw = get('draw');
    var feature = null;
    try { feature = draw && draw.getSnapshotFeature(featureId); } catch (e) { /* gone */ }
    var path = _overlayPath(feature);
    if (!path) return;
    var fs = get('featureStyles')[featureId] || {};
    var color = fs.lineColor || get('lineColor');
    var width = fs.strokeWidth || get('symbolStrokeWidth') || 2;
    var polyline = createLineOverlay(path, lt, color, get('map'), width);
    if (polyline) overlays[featureId] = polyline;
}

function applyLineType(featureId) {
    // New features start with the default line type (solid unless set elsewhere)
    get('featureLineTypes')[featureId] = get('lineType') || 'solid';
    _rebuildLineOverlay(featureId);
}

/** Shape types that take a line type (stars and flight routes are not Terra Draw shapes). */
export const LINE_TYPE_SHAPES = ['linestring', 'polygon', 'rectangle', 'circle', 'freehand'];

/**
 * Change the line type of the selected line or area shape.
 * Applies the line type's default color, redraws the pattern overlay and hides
 * the base outline/line under patterned types.
 * @param {string} newLineType - The new line type key
 * @returns {boolean} true if a feature was updated, false otherwise
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
    if (!_overlayPath(feature)) return false;

    get('featureLineTypes')[selectedId] = newLineType;

    // Use the line type's standard color (e.g. green for obstacles)
    var defaultColor = LINE_TYPE_COLORS[newLineType];
    if (defaultColor) {
        var featureStyles = get('featureStyles');
        if (!featureStyles[selectedId]) featureStyles[selectedId] = {};
        featureStyles[selectedId].lineColor = defaultColor;
        syncMeasureLabel(selectedId);
    }

    _rebuildLineOverlay(selectedId);
    updateDrawStyles();   // re-evaluates outline width / line opacity for the new type
    pushUndoState();
    return true;
}

// ===== Measurement Tool =====

var measureState = {
    active: false,
    points: [],
    polyline: null,
    markers: [],
    infoWindow: null,
    clickListener: null,
    dblClickListener: null,
    keyListener: null,
};

export function enterMeasureMode() {
    exitMeasureMode();
    exitTextPlacement();
    exitSymbolPlacement();
    exitRoutePlacement();
    if (get('ready')) get('draw').setMode('select');

    measureState.active = true;
    measureState.points = [];
    showToast('Click to add points. Double-click or Esc to finish.');

    const map = get('map');

    measureState.clickListener = map.addListener('click', function (e) {
        if (!measureState.active) return;
        addMeasurePoint(e.latLng);
    });

    measureState.dblClickListener = map.addListener('dblclick', function () {
        finishMeasurement();
    });

    measureState.keyListener = function (e) {
        if (e.key === 'Escape') finishMeasurement();
    };
    document.addEventListener('keydown', measureState.keyListener);
}

export function exitMeasureMode() {
    measureState.active = false;
    if (measureState.clickListener) {
        google.maps.event.removeListener(measureState.clickListener);
        measureState.clickListener = null;
    }
    if (measureState.dblClickListener) {
        google.maps.event.removeListener(measureState.dblClickListener);
        measureState.dblClickListener = null;
    }
    if (measureState.keyListener) {
        document.removeEventListener('keydown', measureState.keyListener);
        measureState.keyListener = null;
    }
}

export function clearMeasurement() {
    exitMeasureMode();
    if (measureState.polyline) {
        measureState.polyline.setMap(null);
        measureState.polyline = null;
    }
    measureState.markers.forEach(function (m) { m.setMap(null); });
    measureState.markers = [];
    if (measureState.infoWindow) {
        measureState.infoWindow.close();
        measureState.infoWindow = null;
    }
    measureState.points = [];
}

function addMeasurePoint(latLng) {
    const map = get('map');
    measureState.points.push(latLng);

    // Add small dot marker at the point
    var dot = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF4444',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 5,
        },
        clickable: false,
        zIndex: 200,
    });
    measureState.markers.push(dot);

    // Update or create the polyline
    if (measureState.polyline) {
        measureState.polyline.setPath(measureState.points);
    } else if (measureState.points.length > 1) {
        measureState.polyline = new google.maps.Polyline({
            path: measureState.points,
            strokeColor: '#FF4444',
            strokeOpacity: 1,
            strokeWeight: 3,
            geodesic: true,
            map: map,
        });
    }

    // Show running distance
    if (measureState.points.length > 1) {
        var totalM = computeTotalDistance(measureState.points);
        showMeasureInfo(totalM, measureState.points[measureState.points.length - 1]);
    }
}

function finishMeasurement() {
    if (!measureState.active) return;
    exitMeasureMode();

    if (measureState.points.length < 2) {
        showToast('Need at least 2 points to measure');
        clearMeasurement();
        return;
    }

    var totalM = computeTotalDistance(measureState.points);
    showMeasureInfo(totalM, measureState.points[measureState.points.length - 1]);
    showToast('Measurement complete. Click Measure again to start new.');
}

function computeTotalDistance(points) {
    var total = 0;
    for (var i = 1; i < points.length; i++) {
        total += google.maps.geometry.spherical.computeDistanceBetween(points[i - 1], points[i]);
    }
    return total;
}

function showMeasureInfo(meters, position) {
    var map = get('map');
    var km = meters / 1000;
    var miles = meters * 0.000621371;

    var content = '<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#333;">'
        + '<b>' + Math.round(meters).toLocaleString() + ' m</b><br>'
        + km.toFixed(2) + ' km<br>'
        + miles.toFixed(2) + ' mi'
        + '</div>';

    if (measureState.infoWindow) {
        measureState.infoWindow.setContent(content);
        measureState.infoWindow.setPosition(position);
    } else {
        measureState.infoWindow = new google.maps.InfoWindow({
            content: content,
            position: position,
        });
        measureState.infoWindow.open(map);
    }
}
