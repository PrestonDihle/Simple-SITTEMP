/**
 * Simple SITTEMP - Toolbar Module
 *
 * Toolbar button handlers, submenu building, color picker, and toast notifications.
 */

import { get, set, COLORS } from './state.js';
import {
    equipmentSVG, unitSVG, EQUIPMENT_LIST, UNIT_LIST,
    SHAPE_LIST, LINE_TYPES, getLinePreviewSVG
} from './symbols.js';
import {
    activateShape, enterSymbolPlacement, exitSymbolPlacement,
    enterTextPlacement, exitTextPlacement, clearSelected,
    performUndo, performRedo
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
    buildEquipmentSubmenu();
    buildUnitsSubmenu();
    buildColorSubmenu();

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

    document.getElementById('btn-text').addEventListener('click', function () {
        closeAllSubmenus();
        exitSymbolPlacement();
        setActiveTool('text');
        enterTextPlacement();
    });

    document.getElementById('btn-undo').addEventListener('click', function () { performUndo(); });

    document.getElementById('btn-color').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleSubmenu('submenu-color', 'btn-color');
    });

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

    const list = document.getElementById('line-type-list');
    LINE_TYPES.forEach(function (lt) {
        const item = document.createElement('div');
        item.className = 'submenu-list-item';
        item.dataset.linetype = lt.key;
        const preview = getLinePreviewSVG(lt.key);
        item.innerHTML = `<span style="width:40px;display:inline-block;">${preview}</span><span>${lt.name}</span>`;
        item.addEventListener('click', function () {
            set('lineType', lt.key);
            highlightSubmenuItem(list, item);
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
        item.innerHTML = `<div style="width:28px;height:28px;">${equipmentSVG(eq.key, get('lineColor'))}</div><span>${eq.name}</span>`;
        item.addEventListener('click', function () {
            enterSymbolPlacement('equipment', eq.key);
            closeAllSubmenus();
        });
        grid.appendChild(item);
    });
}

// ===== Units Sub-menu =====

function buildUnitsSubmenu() {
    const grid = document.getElementById('units-grid');
    UNIT_LIST.forEach(function (unit) {
        const item = document.createElement('div');
        item.className = 'submenu-item';
        item.innerHTML = `<div style="width:28px;height:28px;">${unitSVG(unit.key, get('lineColor'))}</div><span>${unit.name}</span>`;
        item.addEventListener('click', function () {
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
}
