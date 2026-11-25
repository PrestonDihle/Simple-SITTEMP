/**
 * Simple SITTEMP - MGRS Grid Overlay Module
 *
 * Handles the MGRS grid display, scale controls, and coordinate readout.
 */

import { get, set, DEFAULT_CENTER, DEFAULT_ZOOM } from './state.js';
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

// ===== Location search =====

/** One coordinate ("35.26", "-116.68", "35 15 45 N", "W116°40.8'") → signed degrees, or null. */
function _parseCoord(str) {
    const hemi = (str.match(/[NSEW]/i) || [''])[0].toUpperCase();
    const nums = str.replace(/[NSEW]/ig, ' ').trim().split(/[\s°º'′"″:]+/).filter(Boolean);
    if (!nums.length || nums.length > 3 || !nums.every(function (n) { return /^[+-]?\d+(\.\d+)?$/.test(n); })) return null;
    const neg = nums[0].charAt(0) === '-';
    const d = Math.abs(parseFloat(nums[0])), m = nums[1] ? parseFloat(nums[1]) : 0, sec = nums[2] ? parseFloat(nums[2]) : 0;
    if (m >= 60 || sec >= 60) return null;
    let v = d + m / 60 + sec / 3600;
    if (neg || hemi === 'S' || hemi === 'W') v = -v;
    return { value: v, hemi: hemi };
}

/**
 * Parse a latitude/longitude pair. Accepts decimal degrees ("35.2625, -116.68",
 * "35.2625 -116.68"), degrees-minutes and degrees-minutes-seconds with N/S/E/W
 * ("35°15'45\"N 116°40'48\"W", "N35 15.75 W116 40.8"), lat first unless the
 * hemisphere letters say otherwise. Returns {lat, lng} or null.
 */
export function parseLatLng(raw) {
    const s = String(raw || '').trim().toUpperCase();
    if (!s || /[^0-9NSEW\s.,°º'′"″:+-]/.test(s)) return null;
    let parts;
    if (s.indexOf(',') !== -1) {
        parts = s.split(',');
    } else if (/[NSEW]/.test(s)) {
        // Split between the two coordinates using the hemisphere letters
        const m = s.match(/^\s*([NS][^NSEW]+)([EW].+)$/) || s.match(/^\s*([EW][^NSEW]+)([NS].+)$/) ||
                  s.match(/^(.+?[NS])\s*(.+?[EW])\s*$/) || s.match(/^(.+?[EW])\s*(.+?[NS])\s*$/);
        if (!m) return null;
        parts = [m[1], m[2]];
    } else {
        parts = s.split(/\s+/);
    }
    if (parts.length !== 2) return null;
    const a = _parseCoord(parts[0]), b = _parseCoord(parts[1]);
    if (!a || !b) return null;
    let lat = a.value, lng = b.value;
    if (a.hemi === 'E' || a.hemi === 'W' || b.hemi === 'N' || b.hemi === 'S') { lat = b.value; lng = a.value; }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat: lat, lng: lng };
}

/** MGRS string → {lat, lng}, or null if it isn't valid MGRS. */
export function mgrsToLatLng(raw) {
    const clean = String(raw || '').replace(/\s+/g, '').toUpperCase();
    if (!/^\d{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}(\d{2}){0,5}$/.test(clean)) return null;
    try {
        const pt = mgrs.toPoint(clean);   // [lng, lat]
        return { lat: pt[1], lng: pt[0] };
    } catch (e) {
        return null;
    }
}

let _geocoder = null;

/**
 * Google geocoder → { status, result } where result is { name, location, bounds } or null.
 * Resolves with status 'TIMEOUT' if Google never answers (it stays silent when the key
 * or referrer is rejected).
 */
function _googleGeocode(query) {
    return new Promise(function (resolve) {
        var done = false;
        function finish(v) { if (!done) { done = true; resolve(v); } }
        setTimeout(function () { finish({ status: 'TIMEOUT', result: null }); }, 4000);
        try {
            if (!_geocoder) _geocoder = new google.maps.Geocoder();
            var ret = _geocoder.geocode({ address: query }, function (results, status) {
                if (status === 'OK' && results && results.length) {
                    var r = results[0];
                    finish({ status: status, result: { name: r.formatted_address, location: r.geometry.location, bounds: r.geometry.viewport || null } });
                } else {
                    finish({ status: status || 'ERROR', result: null });
                }
            });
            // Newer API versions also return a promise that rejects on failure
            if (ret && typeof ret.catch === 'function') {
                ret.catch(function (e) { finish({ status: (e && e.code) || 'ERROR', result: null }); });
            }
        } catch (e) {
            finish({ status: 'ERROR', result: null });
        }
    });
}

/** OpenStreetMap Nominatim (no key needed) → { name, location, bounds } or null. */
function _osmGeocode(query) {
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query);
    return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function (resp) {
            if (!resp.ok) throw new Error('OpenStreetMap search returned ' + resp.status);
            return resp.json();
        })
        .then(function (list) {
            if (!list || !list.length) return null;
            var r = list[0];
            var bb = r.boundingbox;   // [south, north, west, east] as strings
            return {
                name: r.display_name,
                location: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
                bounds: bb ? { south: +bb[0], north: +bb[1], west: +bb[2], east: +bb[3] } : null,
            };
        });
}

/**
 * Place-name search: Google first; if Google refuses, errors or times out, fall back
 * to OpenStreetMap. Resolves with { name, location, bounds } or null (no match).
 */
export function placeSearch(query) {
    return _googleGeocode(query).then(function (g) {
        if (g.result) return g.result;
        if (g.status === 'ZERO_RESULTS') return _osmGeocode(query).catch(function () { return null; });
        console.warn('Google geocoder status ' + g.status + '; using OpenStreetMap');
        return _osmGeocode(query);
    });
}

/** Search box: MGRS, then lat/long, then a place-name search (Google geocoder). */
export function setupMGRSGoto() {
    var input = document.getElementById('mgrs-goto-input');
    var btn = document.getElementById('mgrs-goto-btn');

    function doGoto() {
        var raw = input.value.trim();
        if (!raw) return;
        var map = get('map');

        var p = mgrsToLatLng(raw);
        if (p) {
            map.setCenter(p);
            showToast('Centered on ' + raw.toUpperCase());
            return;
        }
        p = parseLatLng(raw);
        if (p) {
            map.setCenter(p);
            showToast('Centered on ' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5));
            return;
        }

        // Anything else: place-name search
        showToast('Searching for "' + raw + '"...');
        placeSearch(raw).then(function (r) {
            if (r) {
                if (r.bounds) map.fitBounds(r.bounds);
                else { map.setCenter(r.location); map.setZoom(DEFAULT_ZOOM); }
                showToast('Found: ' + r.name, 4000);
            } else {
                showToast('No match for "' + raw + '" (not a place, MGRS or lat/long)');
            }
        }).catch(function (err) {
            console.warn('Place search failed', err);
            showToast('Place search failed: ' + (err && err.message || err), 5000);
        });
    }

    btn.addEventListener('click', doGoto);
    input.addEventListener('keydown', function (e) {
        e.stopPropagation();   // typing here shouldn't trigger map shortcuts
        if (e.key === 'Enter') doGoto();
    });

    // Training-area quick links: center at the app's default zoom
    document.querySelectorAll('.quick-link').forEach(function (link) {
        link.addEventListener('click', function () {
            var target = link.dataset.home
                ? DEFAULT_CENTER
                : { lat: parseFloat(link.dataset.lat), lng: parseFloat(link.dataset.lng) };
            var map = get('map');
            map.setCenter(target);
            map.setZoom(DEFAULT_ZOOM);
            showToast('Centered on ' + link.textContent);
        });
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

    // Grid controls live in the Map submenu (MGRS Grid section)
    const toggle = document.getElementById('grid-toggle');
    toggle.checked = !!get('mgrsGridVisible');
    toggle.addEventListener('change', function () {
        set('mgrsGridVisible', this.checked);
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
