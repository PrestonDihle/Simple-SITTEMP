/**
 * Simple SITTEMP - Export Module
 *
 * KML, PDF, and PNG screenshot export functionality.
 */

import { get } from './state.js';
import { escapeXml } from './symbols.js';
import { showToast } from './toolbar.js';

// ===== Export Setup =====

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
        showPDFSizeDialog();
    });

    document.getElementById('export-screenshot').addEventListener('click', function () {
        document.getElementById('export-dialog').classList.remove('visible');
        exportScreenshot();
    });

    document.querySelectorAll('.size-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
            const size = this.dataset.size;
            document.getElementById('pdf-size-dialog').classList.remove('visible');
            showInterstitial(function () { exportPDF(size); });
        });
    });

    document.getElementById('pdf-size-cancel').addEventListener('click', function () {
        document.getElementById('pdf-size-dialog').classList.remove('visible');
    });
}

function showPDFSizeDialog() {
    document.getElementById('pdf-size-dialog').classList.add('visible');
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

// ===== PDF Export =====

function exportPDF(pageSize) {
    const container = document.getElementById('map-container');
    const sizes = {
        letter: [612, 792],
        tabloid: [792, 1224],
        arch: [1296, 1728],
    };
    const [width, height] = sizes[pageSize] || sizes.letter;

    showToast('Generating PDF...');

    html2canvas(container, { useCORS: true, allowTaint: true, scale: 2, logging: false })
        .then(function (canvas) {
            const { jsPDF } = window.jspdf;
            const orientation = width > height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({ orientation, unit: 'pt', format: [width, height] });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
            pdf.save('sittemp_export.pdf');
            showToast('PDF exported');
        })
        .catch(function (err) {
            showToast('PDF export failed');
            console.error('PDF export error:', err);
        });
}

// ===== Screenshot Export =====

function exportScreenshot() {
    const container = document.getElementById('map-container');
    const banner = document.getElementById('banner-ad');
    // Save the current display value so we can restore it exactly after capture
    const originalDisplay = banner.style.display || '';
    banner.style.display = 'none';

    showToast('Capturing screenshot...');

    html2canvas(container, { useCORS: true, allowTaint: true, scale: 2, logging: false })
        .then(function (canvas) {
            banner.style.display = originalDisplay;
            canvas.toBlob(function (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sittemp_screenshot.png';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Screenshot saved');
            });
        })
        .catch(function (err) {
            banner.style.display = originalDisplay;
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
