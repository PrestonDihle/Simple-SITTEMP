/**
 * Simple SITTEMP - MGRS Grid Overlay Module
 *
 * Handles the MGRS grid display, scale controls, and coordinate readout.
 */

import { get, set } from './state.js';
import { showToast } from './toolbar.js';

// ===== MGRS Formatting =====

/**
 * Parse an MGRS string into its structural components.
 * Returns { gzd, sqid, easting, northing } or null on failure.
 * e.g. "11SNA12345678" → { gzd: "11S", sqid: "NA", easting: "1234", northing: "5678" }
 */
function parseMGRS(mgrsStr) {
    var match = mgrsStr.match(/^(\d{1,2}[A-Z])([A-Z]{2})(\d+)$/);
    if (!match) return null;
    var digits = match[3];
    var half = digits.length / 2;
    // Digits length must be even for a valid MGRS string
    if (digits.length % 2 !== 0) return null;
    return {
        gzd: match[1],
        sqid: match[2],
        easting: digits.slice(0, half),
        northing: digits.slice(half)
    };
}

/**
 * Format an MGRS string with spaces between components.
 * e.g. "11SNA12345678" → "11S NA 1234 5678"
 */
function formatMGRS(mgrsStr) {
    var parsed = parseMGRS(mgrsStr);
    if (parsed) {
        return parsed.gzd + ' ' + parsed.sqid + ' ' + parsed.easting + ' ' + parsed.northing;
    }
    return mgrsStr;
}

// ===== Coordinate Display =====

export function setupMGRSGoto() {
    var input = document.getElementById('mgrs-goto-input');
    var btn = document.getElementById('mgrs-goto-btn');

    function doGoto() {
        var raw = input.value.trim();
        if (!raw) return;
        var clean = raw.replace(/\s+/g, '');
        try {
            var pt = mgrs.toPoint(clean); // returns [lng, lat]
            var map = get('map');
            map.setCenter({ lat: pt[1], lng: pt[0] });
            showToast('Centered on ' + raw.toUpperCase());
        } catch (err) {
            showToast('Invalid MGRS: ' + raw);
        }
    }

    btn.addEventListener('click', doGoto);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doGoto();
    });
}

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
    const latLinesRaw = Math.ceil((endLat - startLat) / degLat);
    const lngLinesRaw = Math.ceil((endLng - startLng) / degLng);
    if (latLinesRaw > maxLines || lngLinesRaw > maxLines) return;
    const latLines = latLinesRaw;
    const lngLines = lngLinesRaw;

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
            const parsed = parseMGRS(mgrsStr);
            if (parsed) {
                // Show the first 2 digits of northing as the row label
                const northingLabel = parsed.northing.slice(0, 2);
                addGridLabel(lat, sw.lng() + 0.003, northingLabel, color, map, gridLabels);
            }
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
            const parsed = parseMGRS(mgrsStr);
            if (parsed) {
                // Show the first 2 digits of easting as the column label
                const eastingLabel = parsed.easting.slice(0, 2);
                addGridLabel(sw.lat() + 0.002, lng, eastingLabel, color, map, gridLabels);
            }
        } catch (e) { /* skip */ }
    }
}

function addGridLabel(lat, lng, text, color, map, gridLabels) {
    const label = new google.maps.Marker({
        position: { lat, lng },
        map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text, color, fontSize: '12px', fontWeight: 'bold', className: 'mgrs-grid-label' },
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
