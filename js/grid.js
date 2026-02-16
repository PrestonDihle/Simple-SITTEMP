/**
 * Simple SITTEMP - MGRS Grid Overlay Module
 *
 * Handles the MGRS grid display, scale controls, and coordinate readout.
 */

import { get, set } from './state.js';
import { showToast } from './toolbar.js';

// ===== MGRS Formatting =====

/**
 * Format an MGRS string with a space between the Grid Zone Designator +
 * 100,000-meter Square ID and the numeric grid reference.
 * e.g. "11SNA12345678" → "11SNA 12345678"
 */
function formatMGRS(mgrsStr) {
    var match = mgrsStr.match(/^(\d{1,2}[A-Z])([A-Z]{2})(\d+)$/);
    if (match) {
        var digits = match[3];
        var half = digits.length / 2;
        var easting = digits.slice(0, half);
        var northing = digits.slice(half);
        return match[1] + ' ' + match[2] + ' ' + easting + ' ' + northing;
    }
    return mgrsStr;
}

// ===== Coordinate Display =====

export function setupCoordinateDisplay() {
    const map = get('map');
    let throttleTimer = null;

    map.addListener('mousemove', function (e) {
        if (throttleTimer) return;
        throttleTimer = setTimeout(function () { throttleTimer = null; }, 50);

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        document.getElementById('coord-latlon').textContent =
            lat.toFixed(6) + ', ' + lng.toFixed(6);

        try {
            const mgrsStr = mgrs.forward([lng, lat], 4);
            document.getElementById('coord-mgrs').textContent = formatMGRS(mgrsStr);
        } catch (err) {
            document.getElementById('coord-mgrs').textContent = '---';
        }
    });
}

// ===== Right-Click MGRS Copy =====

export function setupRightClickMGRS() {
    const map = get('map');

    map.addListener('rightclick', function (e) {
        e.domEvent.preventDefault();
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        try {
            const mgrsStr = formatMGRS(mgrs.forward([lng, lat], 4));
            navigator.clipboard.writeText(mgrsStr).then(function () {
                showToast('MGRS copied: ' + mgrsStr);
            }).catch(function () {
                showToast('MGRS: ' + mgrsStr + ' (copy failed)');
            });
        } catch (err) {
            showToast('Could not compute MGRS');
        }
    });
}

// ===== MGRS Grid Overlay =====

export function setupMGRSGrid() {
    const map = get('map');

    document.getElementById('grid-toggle').addEventListener('click', function () {
        const visible = !get('mgrsGridVisible');
        set('mgrsGridVisible', visible);
        this.classList.toggle('active', visible);
        drawMGRSGrid();
    });

    document.getElementById('grid-scale').addEventListener('change', function () {
        set('mgrsGridScale', parseInt(this.value));
        drawMGRSGrid();
    });

    document.getElementById('grid-color').addEventListener('change', function () {
        set('mgrsGridColor', this.value);
        drawMGRSGrid();
    });

    document.getElementById('grid-weight').addEventListener('change', function () {
        set('mgrsGridWeight', parseFloat(this.value));
        drawMGRSGrid();
    });

    map.addListener('idle', function () {
        drawMGRSGrid();
    });

    setTimeout(drawMGRSGrid, 1000);
}

function drawMGRSGrid() {
    clearMGRSGrid();

    if (!get('mgrsGridVisible')) return;

    const map = get('map');
    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom();
    const gridScale = get('mgrsGridScale');

    if (zoom < 8 && gridScale <= 1000) return;
    if (zoom < 6 && gridScale <= 10000) return;
    if (zoom < 4) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const color = get('mgrsGridColor');
    const weight = get('mgrsGridWeight');

    const midLat = (ne.lat() + sw.lat()) / 2;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(midLat * Math.PI / 180);

    const degLat = gridScale / metersPerDegreeLat;
    const degLng = gridScale / metersPerDegreeLng;

    const startLat = Math.floor(sw.lat() / degLat) * degLat;
    const endLat = Math.ceil(ne.lat() / degLat) * degLat;
    const startLng = Math.floor(sw.lng() / degLng) * degLng;
    const endLng = Math.ceil(ne.lng() / degLng) * degLng;

    const maxLines = 100;
    const latLines = Math.min(Math.ceil((endLat - startLat) / degLat), maxLines);
    const lngLines = Math.min(Math.ceil((endLng - startLng) / degLng), maxLines);
    if (latLines > maxLines || lngLines > maxLines) return;

    const gridLines = get('mgrsGridLines');
    const gridLabels = get('mgrsGridLabels');

    // Horizontal lines
    for (let lat = startLat; lat <= endLat; lat += degLat) {
        const line = new google.maps.Polyline({
            path: [{ lat, lng: startLng }, { lat, lng: endLng }],
            strokeColor: color, strokeOpacity: 0.7, strokeWeight: weight,
            map, clickable: false, zIndex: -1,
        });
        gridLines.push(line);

        try {
            const mgrsStr = mgrs.forward([sw.lng() + 0.001, lat], 5);
            const northing = mgrsStr.slice(-5);
            addGridLabel(lat, sw.lng() + 0.003, northing, color, map, gridLabels);
        } catch (e) { /* skip */ }
    }

    // Vertical lines
    for (let lng = startLng; lng <= endLng; lng += degLng) {
        const line = new google.maps.Polyline({
            path: [{ lat: startLat, lng }, { lat: endLat, lng }],
            strokeColor: color, strokeOpacity: 0.7, strokeWeight: weight,
            map, clickable: false, zIndex: -1,
        });
        gridLines.push(line);

        try {
            const mgrsStr = mgrs.forward([lng, sw.lat() + 0.001], 5);
            const easting = mgrsStr.slice(-10, -5);
            addGridLabel(sw.lat() + 0.002, lng, easting, color, map, gridLabels);
        } catch (e) { /* skip */ }
    }
}

function addGridLabel(lat, lng, text, color, map, gridLabels) {
    const label = new google.maps.Marker({
        position: { lat, lng },
        map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text, color, fontSize: '10px', fontWeight: 'bold', className: 'mgrs-grid-label' },
        clickable: false,
        zIndex: -1,
    });
    gridLabels.push(label);
}

function clearMGRSGrid() {
    const gridLines = get('mgrsGridLines');
    const gridLabels = get('mgrsGridLabels');

    gridLines.forEach(function (line) { line.setMap(null); });
    gridLines.length = 0;
    gridLabels.forEach(function (label) { label.setMap(null); });
    gridLabels.length = 0;
}
