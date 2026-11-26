/**
 * Simple SITTEMP - Export Module
 *
 * KML, PDF, and PNG export. PDF and PNG use a print-area flow: aspect ratio →
 * orientation → movable, resizable print-area box on the locked map → export.
 */

import { get } from './state.js';
import { escapeXml } from './symbols.js';
import { showToast } from './toolbar.js';
import { viewshedKML } from './viewshed.js';
import { measureTitle, measureLines } from './measures.js';
import { routesKML } from './routes.js';
import { contoursKML } from './contours.js';

// ===== Export Setup =====
//
// PDF / PNG flow: choose an aspect ratio → choose portrait or landscape → frame
// the print area with a movable, resizable box on the (locked) map → export.
// KML still exports directly (after the interstitial countdown).

// Paper sizes are portrait inches; generic shapes are long:short.
const PAPER = {
    letter: { name: 'Letter', desc: '8.5 × 11 in', w: 8.5, h: 11 },
    tabloid: { name: 'Tabloid', desc: '11 × 17 in', w: 11, h: 17 },
    arch: { name: 'Arch C', desc: '18 × 24 in', w: 18, h: 24 },
};
const SHAPES = {
    '1:1': { name: '1:1', desc: 'Square', long: 1, short: 1 },
    '4:3': { name: '4:3', desc: 'Standard', long: 4, short: 3 },
    '16:9': { name: '16:9', desc: 'Widescreen', long: 16, short: 9 },
    'free': { name: 'Free', desc: 'Any shape' },
};
const PDF_LONG_SIDE_IN = 11;     // custom page size for generic shapes
const TARGET_DPI = 150;          // capture detail aimed for on the page
const MIN_SCALE = 2, MAX_SCALE = 4;

let _area = null;   // active print-area session

export function setupExport() {
    document.getElementById('export-close').addEventListener('click', function () {
        document.getElementById('export-dialog').classList.remove('visible');
    });

    document.getElementById('export-kml').addEventListener('click', function () {
        document.getElementById('export-dialog').classList.remove('visible');
        showInterstitial(function () { exportKML(); });
    });

    document.getElementById('export-pdf').addEventListener('click', function () {
        document.getElementById('export-dialog').classList.remove('visible');
        _showRatioStep('pdf');
    });

    document.getElementById('export-screenshot').addEventListener('click', function () {
        document.getElementById('export-dialog').classList.remove('visible');
        _showRatioStep('png');
    });

    document.getElementById('export-setup-cancel').addEventListener('click', _closeSetup);
}

// ----- Step dialogs -----

function _closeSetup() {
    document.getElementById('export-setup-dialog').classList.remove('visible');
}

function _setupStep(title, groups, onBack) {
    const dlg = document.getElementById('export-setup-dialog');
    document.getElementById('export-setup-title').textContent = title;
    const box = document.getElementById('export-setup-options');
    box.innerHTML = '';
    groups.forEach(function (g) {
        if (g.label) {
            const h = document.createElement('div');
            h.className = 'size-group-label';
            h.textContent = g.label;
            box.appendChild(h);
        }
        g.items.forEach(function (it) {
            const opt = document.createElement('div');
            opt.className = 'size-option';
            opt.innerHTML = '<span>' + it.name + '</span>' + (it.desc ? '<span class="size-desc">' + it.desc + '</span>' : '');
            opt.addEventListener('click', it.onPick);
            box.appendChild(opt);
        });
    });
    const back = document.getElementById('export-setup-back');
    back.style.display = onBack ? '' : 'none';
    back.onclick = onBack || null;
    dlg.classList.add('visible');
}

function _showRatioStep(format) {
    const groups = [];
    if (format === 'png') {
        groups.push({ items: [{ name: 'Full view', desc: 'Whole screen, as it is now', onPick: function () {
            _closeSetup();
            exportFullScreenshot();
        } }] });
    }
    groups.push({ label: 'Paper', items: Object.keys(PAPER).map(function (k) {
        const p = PAPER[k];
        return { name: p.name, desc: p.desc, onPick: function () { _showOrientationStep(format, { kind: 'paper', key: k }); } };
    }) });
    groups.push({ label: 'Shape', items: Object.keys(SHAPES).map(function (k) {
        const s = SHAPES[k];
        return { name: s.name, desc: s.desc, onPick: function () {
            const ratio = { kind: k === 'free' ? 'free' : 'shape', key: k };
            // Square and Free have no orientation
            if (k === '1:1' || k === 'free') { _closeSetup(); startPrintArea(format, ratio, 'landscape'); }
            else _showOrientationStep(format, ratio);
        } };
    }) });
    _setupStep(format === 'pdf' ? 'PDF: choose page shape' : 'PNG: choose image shape', groups, null);
}

function _showOrientationStep(format, ratio) {
    const pick = function (o) { return function () { _closeSetup(); startPrintArea(format, ratio, o); }; };
    _setupStep('Orientation', [{ items: [
        { name: 'Landscape', desc: 'Wider than tall', onPick: pick('landscape') },
        { name: 'Portrait', desc: 'Taller than wide', onPick: pick('portrait') },
    ] }], function () { _showRatioStep(format); });
}

/** Width ÷ height for a ratio + orientation (null for Free). */
export function aspectFor(ratio, orientation) {
    let long, short;
    if (ratio.kind === 'paper') { const p = PAPER[ratio.key]; long = Math.max(p.w, p.h); short = Math.min(p.w, p.h); }
    else if (ratio.kind === 'shape') { const s = SHAPES[ratio.key]; long = s.long; short = s.short; }
    else return null;
    return orientation === 'portrait' ? short / long : long / short;
}

/** PDF page size in points (w, h) for the chosen ratio and the box's shape. */
export function pageSizePt(ratio, orientation, boxW, boxH) {
    if (ratio.kind === 'paper') {
        const p = PAPER[ratio.key];
        const long = Math.max(p.w, p.h) * 72, short = Math.min(p.w, p.h) * 72;
        return orientation === 'portrait' ? { w: short, h: long } : { w: long, h: short };
    }
    // Generic shape or Free: page shaped like the area, long side PDF_LONG_SIDE_IN
    const long = PDF_LONG_SIDE_IN * 72;
    return boxW >= boxH ? { w: long, h: long * boxH / boxW } : { w: long * boxW / boxH, h: long };
}

// ----- Print-area box -----

function _ratioLabel(ratio, orientation) {
    const base = ratio.kind === 'paper' ? PAPER[ratio.key].name : SHAPES[ratio.key].name;
    return (ratio.kind === 'paper' || (ratio.kind === 'shape' && ratio.key !== '1:1')) ? base + ' · ' + orientation : base;
}

function _lockMap(lock) {
    const map = get('map');
    if (!map) return;
    if (lock) {
        _area.mapOpts = { gestureHandling: map.get('gestureHandling'), keyboardShortcuts: map.get('keyboardShortcuts'), draggable: map.get('draggable') };
        map.setOptions({ gestureHandling: 'none', keyboardShortcuts: false, draggable: false, disableDoubleClickZoom: true });
    } else if (_area && _area.mapOpts) {
        map.setOptions({
            gestureHandling: _area.mapOpts.gestureHandling || 'auto',
            keyboardShortcuts: _area.mapOpts.keyboardShortcuts !== false,
            draggable: _area.mapOpts.draggable !== false,
            disableDoubleClickZoom: false,
        });
    }
}

/** Largest box of the given aspect that fits in 80% of the container, centered. */
function _initialBox(cw, ch, aspect) {
    let w = cw * 0.8, h = ch * 0.8;
    if (aspect) { if (w / h > aspect) w = h * aspect; else h = w / aspect; }
    return { x: (cw - w) / 2, y: (ch - h) / 2, w: w, h: h };
}

export function startPrintArea(format, ratio, orientation) {
    cancelPrintArea();
    const container = document.getElementById('map-container');
    const layer = document.createElement('div');
    layer.id = 'print-area-layer';
    layer.innerHTML =
        '<div id="print-area-box">' +
        '  <div class="pa-handle" data-h="nw"></div><div class="pa-handle" data-h="ne"></div>' +
        '  <div class="pa-handle" data-h="sw"></div><div class="pa-handle" data-h="se"></div>' +
        '  <div id="print-area-bar">' +
        '    <span id="print-area-label"></span>' +
        '    <button id="print-area-rotate" title="Swap portrait / landscape">⟲ Rotate</button>' +
        '    <button id="print-area-cancel">Cancel</button>' +
        '    <button id="print-area-export" class="pa-primary"></button>' +
        '  </div>' +
        '</div>';
    container.appendChild(layer);

    _area = { format: format, ratio: ratio, orientation: orientation, layer: layer, box: null, saved: null, mapOpts: null };
    _area.saved = hideUIForExport();
    _lockMap(true);

    const cw = container.clientWidth, ch = container.clientHeight;
    _area.box = _initialBox(cw, ch, aspectFor(ratio, orientation));
    _renderBox();

    const canRotate = ratio.kind === 'paper' || (ratio.kind === 'shape' && ratio.key !== '1:1');
    document.getElementById('print-area-rotate').style.display = canRotate ? '' : 'none';
    document.getElementById('print-area-export').textContent = format === 'pdf' ? 'Export PDF' : 'Export PNG';
    document.getElementById('print-area-rotate').addEventListener('click', function (e) { e.stopPropagation(); _rotateBox(); });
    document.getElementById('print-area-cancel').addEventListener('click', function (e) { e.stopPropagation(); cancelPrintArea(); });
    document.getElementById('print-area-export').addEventListener('click', function (e) { e.stopPropagation(); _confirmPrintArea(); });

    _area.onKey = function (e) {
        if (e.key === 'Escape') { e.preventDefault(); cancelPrintArea(); }
        else if (e.key === 'Enter') { e.preventDefault(); _confirmPrintArea(); }
    };
    document.addEventListener('keydown', _area.onKey, true);

    _area.onResize = function () { _clampBox(); _renderBox(); };
    window.addEventListener('resize', _area.onResize);

    _wireDrag(document.getElementById('print-area-box'));
    showToast('Drag to move, pull a corner to resize, then Export. Esc cancels.', 4000);
}

export function cancelPrintArea() {
    if (!_area) return;
    _lockMap(false);
    restoreUI(_area.saved);
    document.removeEventListener('keydown', _area.onKey, true);
    window.removeEventListener('resize', _area.onResize);
    _area.layer.remove();
    _area = null;
}

function _renderBox() {
    const el = document.getElementById('print-area-box');
    if (!el || !_area) return;
    const b = _area.box;
    el.style.left = b.x + 'px';
    el.style.top = b.y + 'px';
    el.style.width = b.w + 'px';
    el.style.height = b.h + 'px';
    document.getElementById('print-area-label').textContent =
        _ratioLabel(_area.ratio, _area.orientation) + ' · ' + Math.round(b.w) + '×' + Math.round(b.h) + ' px';
}

function _clampBox() {
    const c = document.getElementById('map-container');
    const cw = c.clientWidth, ch = c.clientHeight, b = _area.box;
    const aspect = aspectFor(_area.ratio, _area.orientation);
    if (b.w > cw) { b.w = cw; if (aspect) b.h = b.w / aspect; }
    if (b.h > ch) { b.h = ch; if (aspect) b.w = b.h * aspect; }
    b.x = Math.max(0, Math.min(cw - b.w, b.x));
    b.y = Math.max(0, Math.min(ch - b.h, b.y));
}

/** Swap portrait/landscape around the box center, shrinking if needed to fit. */
function _rotateBox() {
    const b = _area.box;
    _area.orientation = _area.orientation === 'portrait' ? 'landscape' : 'portrait';
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const w = b.h, h = b.w;
    b.w = w; b.h = h; b.x = cx - w / 2; b.y = cy - h / 2;
    _clampBox();
    _renderBox();
}

const MIN_BOX = 60;

function _wireDrag(el) {
    el.addEventListener('pointerdown', function (e) {
        if (e.target.closest('#print-area-bar')) return;
        e.preventDefault();
        e.stopPropagation();
        const handle = e.target.dataset ? e.target.dataset.h : null;
        const start = { x: e.clientX, y: e.clientY, box: Object.assign({}, _area.box) };
        const c = document.getElementById('map-container');
        const cw = c.clientWidth, ch = c.clientHeight;
        const aspect = aspectFor(_area.ratio, _area.orientation);
        el.setPointerCapture(e.pointerId);

        function move(ev) {
            const dx = ev.clientX - start.x, dy = ev.clientY - start.y, s = start.box;
            if (!handle) {
                _area.box.x = Math.max(0, Math.min(cw - s.w, s.x + dx));
                _area.box.y = Math.max(0, Math.min(ch - s.h, s.y + dy));
            } else {
                // Resize from a corner; the opposite corner stays put
                const left = handle.indexOf('w') !== -1, top = handle.indexOf('n') !== -1;
                const ax = left ? s.x + s.w : s.x, ay = top ? s.y + s.h : s.y;      // anchor corner
                const maxW = left ? ax : cw - ax, maxH = top ? ay : ch - ay;
                let w = Math.max(MIN_BOX, Math.min(maxW, s.w + (left ? -dx : dx)));
                let h = Math.max(MIN_BOX, Math.min(maxH, s.h + (top ? -dy : dy)));
                if (aspect) {
                    // Follow whichever drag direction is larger, then fit inside the room available
                    if (Math.abs(dx) >= Math.abs(dy) * aspect) h = w / aspect; else w = h * aspect;
                    if (w > maxW) { w = maxW; h = w / aspect; }
                    if (h > maxH) { h = maxH; w = h * aspect; }
                    if (w < MIN_BOX || h < MIN_BOX) { const k = Math.max(MIN_BOX / w, MIN_BOX / h); w *= k; h *= k; }
                }
                _area.box.w = w; _area.box.h = h;
                _area.box.x = left ? ax - w : ax;
                _area.box.y = top ? ay - h : ay;
            }
            _renderBox();
        }
        function up(ev) {
            el.releasePointerCapture(ev.pointerId);
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerup', up);
            el.removeEventListener('pointercancel', up);
        }
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
    });
}

/** html2canvas scale aiming for TARGET_DPI over the output's long side. */
export function captureScale(boxW, boxH, longSideIn) {
    const needed = longSideIn * TARGET_DPI;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, needed / Math.max(boxW, boxH)));
}

function _confirmPrintArea() {
    if (!_area) return;
    const a = _area;
    const box = Object.assign({}, a.box);
    // Hide the selector, keep the rest of the UI hidden for the capture
    a.layer.style.display = 'none';
    const page = a.format === 'pdf' ? pageSizePt(a.ratio, a.orientation, box.w, box.h) : null;
    const longIn = page ? Math.max(page.w, page.h) / 72 : PDF_LONG_SIDE_IN;
    const scale = captureScale(box.w, box.h, longIn);
    showToast(a.format === 'pdf' ? 'Generating PDF...' : 'Capturing image...');

    const container = document.getElementById('map-container');
    html2canvas(container, { useCORS: true, allowTaint: true, scale: scale, logging: false })
        .then(function (full) {
            cancelPrintArea();
            // Crop the capture to the print area
            const crop = document.createElement('canvas');
            crop.width = Math.round(box.w * scale);
            crop.height = Math.round(box.h * scale);
            crop.getContext('2d').drawImage(full, Math.round(box.x * scale), Math.round(box.y * scale), crop.width, crop.height,
                0, 0, crop.width, crop.height);
            if (a.format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: page.w >= page.h ? 'landscape' : 'portrait', unit: 'pt', format: [page.w, page.h] });
                pdf.addImage(crop.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, page.w, page.h);
                pdf.save('sittemp_export.pdf');
                showToast('PDF exported');
            } else {
                crop.toBlob(function (blob) { _downloadBlob('sittemp_screenshot.png', blob); showToast('Screenshot saved'); });
            }
        })
        .catch(function (err) {
            cancelPrintArea();
            showToast(a.format === 'pdf' ? 'PDF export failed' : 'Screenshot failed');
            console.error('Export error:', err);
        });
}

function _downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function showInterstitial(callback) {
    const dialog = document.getElementById('interstitial-ad');
    const timerEl = document.getElementById('countdown-timer');
    dialog.classList.add('visible');

    let seconds = 5;
    timerEl.textContent = seconds;

    const interval = setInterval(function () {
        seconds--;
        timerEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            dialog.classList.remove('visible');
            callback();
        }
    }, 1000);
}

// ===== KML Export =====

function exportKML() {
    const draw = get('draw');
    const markers = get('markers');
    let features = [];

    if (draw) {
        const snapshot = draw.getSnapshot().filter(function (f) {
            return !f.properties.selectionPoint && !f.properties.midPoint;
        });
        features = features.concat(snapshot);
    }

    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kml += '<Document>\n';
    kml += '<name>Simple SITTEMP Export</name>\n';

    features.forEach(function (f, i) { kml += featureToKML(f, i); });

    markers.forEach(function (m, i) {
        const pos = m.getPosition();
        const st = m._sittemp || {};
        const label = st.type === 'general_point' ? [st.fn || 'POINT', st.text, st.unit].filter(Boolean).join(' ') : (st.text || st.key);
        const name = escapeXml(label || 'Marker ' + i);
        kml += '<Placemark>\n';
        kml += '<name>' + name + '</name>\n';
        kml += '<Point><coordinates>' + pos.lng() + ',' + pos.lat() + ',0</coordinates></Point>\n';
        kml += '</Placemark>\n';
        kml += viewshedKML(m, name);
    });

    kml += routesKML();
    kml += contoursKML();

    kml += '</Document>\n</kml>';

    downloadFile('sittemp_export.kml', kml, 'application/vnd.google-earth.kml+xml');
    showToast('KML exported');
}

function featureToKML(feature, index) {
    const m = (get('featureMeasures') || {})[feature.id];
    let kml = '<Placemark>\n';
    kml += '<name>' + escapeXml(measureTitle(m) || ('Feature ' + index)) + '</name>\n';
    if (m) kml += '<description>' + escapeXml(measureLines(m).join('\n')) + '</description>\n';

    const geom = feature.geometry;
    if (geom.type === 'Point') {
        kml += '<Point><coordinates>' + geom.coordinates[0] + ',' + geom.coordinates[1] + ',0</coordinates></Point>\n';
    } else if (geom.type === 'LineString') {
        kml += '<LineString><coordinates>\n';
        geom.coordinates.forEach(function (c) { kml += c[0] + ',' + c[1] + ',0\n'; });
        kml += '</coordinates></LineString>\n';
    } else if (geom.type === 'Polygon') {
        kml += '<Polygon><outerBoundaryIs><LinearRing><coordinates>\n';
        geom.coordinates[0].forEach(function (c) { kml += c[0] + ',' + c[1] + ',0\n'; });
        kml += '</coordinates></LinearRing></outerBoundaryIs></Polygon>\n';
    }

    kml += '</Placemark>\n';
    return kml;
}

// ===== UI Hide/Show for Clean Export =====

// Elements to hide during export (everything except map + classification banner)
const EXPORT_HIDE_IDS = [
    'toolbar', 'coord-display', 'object-popover', 'toolbar-tooltip', 'route-card',
    'submenu-shapes', 'submenu-equipment', 'submenu-units', 'submenu-enemy-units', 'submenu-tactical-tasks', 'submenu-text', 'submenu-map'
];

function hideUIForExport() {
    const saved = [];
    EXPORT_HIDE_IDS.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            saved.push({ el: el, display: el.style.display });
            el.style.display = 'none';
        }
    });
    return saved;
}

function restoreUI(saved) {
    saved.forEach(function (item) {
        item.el.style.display = item.display;
    });
}

// ===== Full-view PNG (no print area) =====

function exportFullScreenshot() {
    const container = document.getElementById('map-container');
    showToast('Capturing screenshot...');
    const saved = hideUIForExport();
    html2canvas(container, { useCORS: true, allowTaint: true, scale: 2, logging: false })
        .then(function (canvas) {
            restoreUI(saved);
            canvas.toBlob(function (blob) { _downloadBlob('sittemp_screenshot.png', blob); showToast('Screenshot saved'); });
        })
        .catch(function (err) {
            restoreUI(saved);
            showToast('Screenshot failed');
            console.error('Screenshot error:', err);
        });
}

// ===== Download Helper =====

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
