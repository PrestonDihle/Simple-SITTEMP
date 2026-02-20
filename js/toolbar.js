/**
 * Simple SITTEMP - Toolbar Module
 *
 * Toolbar button handlers, submenu building, color picker, and toast notifications.
 */

import { get, set, subscribe, COLORS } from './state.js';
import {
    equipmentSVG, unitSVG, EQUIPMENT_LIST, UNIT_LIST,
    SHAPE_LIST, LINE_TYPES, getLinePreviewSVG
} from './symbols.js';
import {
    activateShape, enterSymbolPlacement, exitSymbolPlacement,
    enterTextPlacement, exitTextPlacement, clearSelected,
    performUndo, performRedo, buildTextSVG, pushUndoState,
    changeLineType
} from './drawing.js';

// ===== Toast =====

export function showToast(message, duration) {
    duration = duration || 2000;
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('visible');
    setTimeout(function () { el.classList.remove('visible'); }, duration);
}

// ===== Toolbar Setup =====

export function setupToolbar() {
    buildShapesSubmenu();
    buildLinesSubmenu();
    buildEquipmentSubmenu();
    buildUnitsSubmenu();
    buildColorSubmenu();
    buildTextSubmenu();
    buildMapSubmenu();

    document.getElementById('btn-select').addEventListener('click', function () {
        closeAllSubmenus();
        setActiveTool('select');
        exitSymbolPlacement();
        exitTextPlacement();
        if (get('ready')) get('draw').setMode('select');
    });

    document.getElementById('btn-shapes').addEventListener('click', function (e) {
        e.stopPropagation();
        exitSymbolPlacement();
        exitTextPlacement();
        toggleSubmenu('submenu-shapes', 'btn-shapes');
    });

    // Lines button removed — line types now in right-side Style Panel

    document.getElementById('btn-equipment').addEventListener('click', function (e) {
        e.stopPropagation();
        exitTextPlacement();
        toggleSubmenu('submenu-equipment', 'btn-equipment');
    });

    document.getElementById('btn-units').addEventListener('click', function (e) {
        e.stopPropagation();
        exitTextPlacement();
        toggleSubmenu('submenu-units', 'btn-units');
    });

    document.getElementById('btn-text').addEventListener('click', function (e) {
        e.stopPropagation();
        exitSymbolPlacement();
        toggleSubmenu('submenu-text', 'btn-text');
    });

    document.getElementById('btn-map').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleSubmenu('submenu-map', 'btn-map');
    });

    document.getElementById('btn-undo').addEventListener('click', function () { performUndo(); });

    // Color button removed — color picker now in right-side Style Panel

    document.getElementById('btn-redo').addEventListener('click', function () { performRedo(); });

    document.getElementById('btn-clear').addEventListener('click', function () { clearSelected(); });

    document.getElementById('btn-export').addEventListener('click', function () {
        closeAllSubmenus();
        document.getElementById('export-dialog').classList.add('visible');
    });

    document.getElementById('map').addEventListener('click', function () { closeAllSubmenus(); });

    positionSubmenus();
}

// ===== Submenu Helpers =====

function positionSubmenus() {
    const menuMap = {
        'btn-shapes': 'submenu-shapes',
        'btn-equipment': 'submenu-equipment',
        'btn-units': 'submenu-units',
        'btn-text': 'submenu-text',
        'btn-map': 'submenu-map',
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
        set('openSubmenu', menuId);
        const btn = document.getElementById(btnId);
        const rect = btn.getBoundingClientRect();
        menu.style.top = rect.top + 'px';
    }
}

function closeAllSubmenus() {
    document.querySelectorAll('.submenu').forEach(function (el) { el.classList.remove('visible'); });
    set('openSubmenu', null);
}

export function setActiveTool(tool) {
    document.querySelectorAll('.toolbar-btn').forEach(function (btn) { btn.classList.remove('active'); });
    const btnMap = { select: 'btn-select', shapes: 'btn-shapes', equipment: 'btn-equipment', units: 'btn-units', text: 'btn-text' };
    if (btnMap[tool]) document.getElementById(btnMap[tool]).classList.add('active');
    set('currentMode', tool);
}

function highlightSubmenuItem(container, active) {
    container.querySelectorAll('.submenu-item, .submenu-list-item').forEach(function (el) { el.classList.remove('active'); });
    active.classList.add('active');
}

// ===== Shapes Sub-menu =====

function buildShapesSubmenu() {
    const grid = document.getElementById('shape-grid');
    SHAPE_LIST.forEach(function (shape) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.dataset.shape = shape.key;
        item.innerHTML = `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5">${shape.icon}</svg><span>${shape.name}</span>`;
        item.addEventListener('click', function () {
            exitSymbolPlacement();
            exitTextPlacement();
            setActiveTool('shapes');
            activateShape(shape.key);
            highlightSubmenuItem(grid, item);
        });
        grid.appendChild(item);
    });
}

// ===== Lines Sub-menu =====

function buildLinesSubmenu() {
    const list = document.getElementById('line-type-list');
    LINE_TYPES.forEach(function (lt) {
        const item = document.createElement('div');
        item.className = 'submenu-list-item';
        item.dataset.linetype = lt.key;
        const preview = getLinePreviewSVG(lt.key);
        item.innerHTML = `<span>${preview}</span><span>${lt.name}</span>`;
        item.addEventListener('click', function () {
            set('lineType', lt.key);
            highlightSubmenuItem(list, item);

            // If a line is currently selected, change its type
            if (get('selectedFeatureId')) {
                var changed = changeLineType(lt.key);
                if (changed) {
                    showToast('Line type changed to ' + lt.name);
                }
            }
        });
        if (lt.key === 'solid') item.classList.add('active');
        list.appendChild(item);
    });
}

// ===== Equipment Sub-menu =====

function buildEquipmentSubmenu() {
    const grid = document.getElementById('equipment-grid');
    EQUIPMENT_LIST.forEach(function (eq) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.dataset.eqKey = eq.key;
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'width:28px;height:28px;';
        iconDiv.innerHTML = equipmentSVG(eq.key, get('lineColor'), get('symbolStrokeWidth'));
        item.appendChild(iconDiv);
        const label = document.createElement('span');
        label.textContent = eq.name;
        item.appendChild(label);
        item.addEventListener('click', function () {
            enterSymbolPlacement('equipment', eq.key);
            closeAllSubmenus();
        });
        grid.appendChild(item);
    });

    // Update icons when line color or stroke width changes
    subscribe(['lineColor', 'symbolStrokeWidth'], function () {
        const color = get('lineColor');
        const sw = get('symbolStrokeWidth');
        grid.querySelectorAll('.submenu-item[data-eq-key]').forEach(function (item) {
            const key = item.dataset.eqKey;
            item.querySelector('div').innerHTML = equipmentSVG(key, color, sw);
        });
    });
}

// ===== Units Sub-menu =====

function buildUnitsSubmenu() {
    const grid = document.getElementById('units-grid');
    UNIT_LIST.forEach(function (unit) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.dataset.unitKey = unit.key;
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'width:28px;height:28px;';
        iconDiv.innerHTML = unitSVG(unit.key, get('lineColor'), get('symbolStrokeWidth'));
        item.appendChild(iconDiv);
        const label = document.createElement('span');
        label.textContent = unit.name;
        item.appendChild(label);
        item.addEventListener('click', function () {
            enterSymbolPlacement('unit', unit.key);
            closeAllSubmenus();
        });
        grid.appendChild(item);
    });

    // Update icons when line color or stroke width changes
    subscribe(['lineColor', 'symbolStrokeWidth'], function () {
        const color = get('lineColor');
        const sw = get('symbolStrokeWidth');
        grid.querySelectorAll('.submenu-item[data-unit-key]').forEach(function (item) {
            const key = item.dataset.unitKey;
            item.querySelector('div').innerHTML = unitSVG(key, color, sw);
        });
    });
}

// ===== Color Sub-menu =====

function buildColorSubmenu() {
    const lineSwatches = document.getElementById('line-color-swatches');
    const fillSwatches = document.getElementById('fill-color-swatches');

    for (const [name, hex] of Object.entries(COLORS)) {
        // Line color swatch
        const lineSwatch = document.createElement('div');
        lineSwatch.className = 'color-swatch' + (hex === get('lineColor') ? ' active' : '');
        lineSwatch.style.background = hex;
        if (hex === '#FFFFFF') lineSwatch.style.border = '2px solid #999';
        lineSwatch.title = name;
        lineSwatch.addEventListener('click', function () {
            set('lineColor', hex);
            lineSwatches.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('active'); });
            lineSwatch.classList.add('active');
        });
        lineSwatches.appendChild(lineSwatch);

        // Fill color swatch
        const fillSwatch = document.createElement('div');
        fillSwatch.className = 'color-swatch' + (hex === get('fillColor') ? ' active' : '');
        fillSwatch.style.background = hex;
        if (hex === '#FFFFFF') fillSwatch.style.border = '2px solid #999';
        fillSwatch.title = name;
        fillSwatch.addEventListener('click', function () {
            set('fillColor', hex);
            fillSwatches.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('active'); });
            fillSwatch.classList.add('active');
        });
        fillSwatches.appendChild(fillSwatch);
    }

    const slider = document.getElementById('opacity-slider');
    const valueLabel = document.getElementById('opacity-value');
    slider.addEventListener('input', function () {
        set('fillOpacity', parseInt(slider.value) / 100);
        valueLabel.textContent = slider.value + '%';
    });

    var swSlider = document.getElementById('stroke-width-slider');
    var swLabel = document.getElementById('stroke-width-value');
    swSlider.addEventListener('input', function () {
        set('symbolStrokeWidth', parseInt(swSlider.value));
        swLabel.textContent = swSlider.value;
    });

    var scaleSlider = document.getElementById('symbol-scale-slider');
    var scaleLabel = document.getElementById('symbol-scale-value');
    scaleSlider.addEventListener('input', function () {
        set('symbolScale', parseFloat(scaleSlider.value));
        scaleLabel.textContent = parseFloat(scaleSlider.value).toFixed(1) + 'x';
    });
}

// ===== Text Sub-menu =====

function buildTextSubmenu() {
    // "Place Text on Map" button
    document.getElementById('btn-place-text').addEventListener('click', function () {
        closeAllSubmenus();
        setActiveTool('text');
        enterTextPlacement();
    });

    // ===== Font Style Toggles =====
    var fontBoldBtn = document.getElementById('font-bold');
    var fontItalicBtn = document.getElementById('font-italic');
    var fontUnderlineBtn = document.getElementById('font-underline');
    var fontStrikethroughBtn = document.getElementById('font-strikethrough');

    fontBoldBtn.addEventListener('click', function () {
        var val = !get('fontBold');
        set('fontBold', val);
    });
    fontItalicBtn.addEventListener('click', function () {
        var val = !get('fontItalic');
        set('fontItalic', val);
    });
    fontUnderlineBtn.addEventListener('click', function () {
        var val = !get('fontUnderline');
        set('fontUnderline', val);
    });
    fontStrikethroughBtn.addEventListener('click', function () {
        var val = !get('fontStrikethrough');
        set('fontStrikethrough', val);
    });

    // Font size slider
    var fontSizeSlider = document.getElementById('font-size-slider');
    var fontSizeLabel = document.getElementById('font-size-value');
    fontSizeSlider.addEventListener('input', function () {
        var val = parseInt(fontSizeSlider.value);
        set('fontSize', val);
        fontSizeLabel.textContent = val + 'px';
    });

    // ===== UI Sync: update button active states when state changes =====
    subscribe('fontBold', function (val) {
        fontBoldBtn.classList.toggle('active', val);
    });
    subscribe('fontItalic', function (val) {
        fontItalicBtn.classList.toggle('active', val);
    });
    subscribe('fontUnderline', function (val) {
        fontUnderlineBtn.classList.toggle('active', val);
    });
    subscribe('fontStrikethrough', function (val) {
        fontStrikethroughBtn.classList.toggle('active', val);
    });
    subscribe('fontSize', function (val) {
        fontSizeSlider.value = val;
        fontSizeLabel.textContent = val + 'px';
    });

    // ===== Live editing: update selected text marker when font/color changes =====
    subscribe(['fontSize', 'fontBold', 'fontItalic', 'fontUnderline', 'fontStrikethrough', 'lineColor'], function () {
        applyFontToSelectedText();
    });
}

// ===== Apply Font Changes to Selected Text Marker =====

function applyFontToSelectedText() {
    var markers = get('markers');
    var selected = null;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]._selected && markers[i]._sittemp && markers[i]._sittemp.type === 'text') {
            selected = markers[i];
            break;
        }
    }
    if (!selected) return;

    var info = selected._sittemp;
    var color = get('lineColor');
    var fontSize = get('fontSize');
    var fontBold = get('fontBold');
    var fontItalic = get('fontItalic');
    var fontUnderline = get('fontUnderline');
    var fontStrikethrough = get('fontStrikethrough');

    // Early exit if nothing actually changed
    if (info.color === color &&
        (info.fontSize || 14) === fontSize &&
        (info.fontBold !== undefined ? info.fontBold : true) === fontBold &&
        (info.fontItalic || false) === fontItalic &&
        (info.fontUnderline || false) === fontUnderline &&
        (info.fontStrikethrough || false) === fontStrikethrough) {
        return;
    }

    var result = buildTextSVG(info.text, color, fontSize, fontBold, fontItalic, fontUnderline, fontStrikethrough);
    var iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(result.svg);

    selected.setIcon({
        url: iconUrl,
        scaledSize: new google.maps.Size(result.width, result.height),
        anchor: new google.maps.Point(result.width / 2, result.height / 2)
    });

    // Update metadata
    info.color = color;
    info.fontSize = fontSize;
    info.fontBold = fontBold;
    info.fontItalic = fontItalic;
    info.fontUnderline = fontUnderline;
    info.fontStrikethrough = fontStrikethrough;

    // Debounced undo push (300ms) to avoid spam from slider dragging
    if (applyFontToSelectedText._undoTimer) clearTimeout(applyFontToSelectedText._undoTimer);
    applyFontToSelectedText._undoTimer = setTimeout(function () {
        pushUndoState();
    }, 300);
}

// ===== Map Type Sub-menu =====

function buildMapSubmenu() {
    var terrainBtn = document.getElementById('map-terrain');
    var satelliteBtn = document.getElementById('map-satellite');
    var roadsToggle = document.getElementById('toggle-roads');
    var labelsToggle = document.getElementById('toggle-labels');
    var citiesOnlyToggle = document.getElementById('toggle-cities-only');
    var citiesOnlyRow = citiesOnlyToggle.closest('.toggle-row');

    // Terrain / Satellite buttons
    terrainBtn.addEventListener('click', function () {
        set('mapBaseType', 'terrain');
        terrainBtn.classList.add('active');
        satelliteBtn.classList.remove('active');
        applyMapStyles();
    });

    satelliteBtn.addEventListener('click', function () {
        set('mapBaseType', 'satellite');
        satelliteBtn.classList.add('active');
        terrainBtn.classList.remove('active');
        applyMapStyles();
    });

    // Roads toggle
    roadsToggle.addEventListener('change', function () {
        set('showRoads', roadsToggle.checked);
        applyMapStyles();
    });

    // Labels toggle
    labelsToggle.addEventListener('change', function () {
        set('showLabels', labelsToggle.checked);
        if (!labelsToggle.checked) {
            citiesOnlyToggle.checked = false;
            set('citiesOnly', false);
            citiesOnlyRow.classList.add('disabled');
        } else {
            citiesOnlyRow.classList.remove('disabled');
        }
        applyMapStyles();
    });

    // Cities Only toggle
    citiesOnlyToggle.addEventListener('change', function () {
        set('citiesOnly', citiesOnlyToggle.checked);
        applyMapStyles();
    });
}

function applyMapStyles() {
    var map = get('map');
    if (!map) return;

    var baseType = get('mapBaseType');
    var showLabels = get('showLabels');
    var citiesOnly = get('citiesOnly');

    // Set map type ID
    if (baseType === 'satellite') {
        map.setMapTypeId(showLabels && !citiesOnly ? 'hybrid' : 'satellite');
    } else {
        map.setMapTypeId('terrain');
    }

    var styles = [];

    // Hide roads
    if (!get('showRoads')) {
        styles.push({ featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'off' }] });
        styles.push({ featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] });
    }

    // Hide all labels
    if (!showLabels) {
        styles.push({ featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] });
    }
    // Cities only: hide all labels except locality (city) labels
    else if (citiesOnly) {
        styles.push({ featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] });
        styles.push({ featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'on' }] });
    }

    map.setOptions({ styles: styles });
}
