/**
 * Simple SITTEMP - Application Entry Point
 *
 * Initializes the application: classification modal, API key handling,
 * Google Maps loading, and wiring up all modules.
 */

import { get, set, DEFAULT_CENTER, DEFAULT_ZOOM } from './js/state.js';
import { initTerraDraw, rotateSelectedMarker } from './js/drawing.js';
import { setupToolbar, setActiveTool } from './js/toolbar.js';
import { setupCoordinateDisplay, setupRightClickMGRS, setupMGRSGrid } from './js/grid.js';
import { setupExport } from './js/export.js';

// ===== Initialization =====

function initApp() {
    // Handle classification modal
    if (!sessionStorage.getItem('sittemp_classified_ack')) {
        document.getElementById('classification-modal').style.display = 'flex';
    } else {
        document.getElementById('classification-modal').style.display = 'none';
    }

    document.getElementById('classification-accept').addEventListener('click', function () {
        sessionStorage.setItem('sittemp_classified_ack', 'true');
        document.getElementById('classification-modal').style.display = 'none';
    });

    // Load Google Maps directly with the supplied API key
    const API_KEY = 'AIzaSyBmRTGBlVJF5GVbYqra1nRicPEjJBXWKKY';
    loadGoogleMaps(API_KEY);
}

// ===== Google Maps Loading =====

function loadGoogleMaps(apiKey) {
    // initMap must be on window for the JSONP callback
    window.initMap = initMap;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
}

function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: 'terrain',
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
    });

    set('map', map);

    // Wait for projection before Terra Draw init
    map.addListener('projection_changed', function () {
        if (get('draw')) return;
        initTerraDraw();
        // Set initial tool after Terra Draw is ready
        setActiveTool('select');
    });

    // Wire up all modules
    setupCoordinateDisplay();
    setupRightClickMGRS();
    setupToolbar();
    setupMGRSGrid();
    setupExport();

    // Keyboard shortcut: R to rotate selected equipment/unit symbol
    document.addEventListener('keydown', function (e) {
        // Don't intercept if user is typing in an input or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            // Shift+R = counter-clockwise 15°, R = clockwise 15°
            rotateSelectedMarker(e.shiftKey ? -15 : 15);
        }
    });
}

// ===== Boot =====

document.addEventListener('DOMContentLoaded', initApp);
