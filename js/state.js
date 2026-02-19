/**
 * Simple SITTEMP - Reactive State Manager
 *
 * Provides a centralized, observable state store with pub/sub notifications.
 * Modules subscribe to specific state keys and get called automatically
 * when those values change.
 */

// ===== Constants =====
export const DEFAULT_CENTER = { lat: 35.2625, lng: -116.6800 }; // Fort Irwin / NTC
export const DEFAULT_ZOOM = 12;
export const MAX_UNDO_STATES = 50;

export const COLORS = {
    Green:  '#00AA00',
    Blue:   '#0000FF',
    Red:    '#FF0000',
    Purple: '#800080',
    Orange: '#FF8C00',
    Black:  '#000000',
    White:  '#FFFFFF',
    Grey:   '#808080'
};

// ===== Initial State Shape =====
const initialState = {
    // Core map objects (set once, not typically observed)
    map: null,
    draw: null,
    ready: false,

    // Current tool / drawing mode
    currentMode: 'select',

    // Style settings
    lineColor: '#FF0000',
    fillColor: '#FF0000',
    fillOpacity: 0.6,
    lineType: 'solid',
    symbolStrokeWidth: 8,
    symbolScale: 1.0,

    // Font settings for text labels
    fontSize: 14,
    fontBold: true,
    fontItalic: false,
    fontUnderline: false,
    fontStrikethrough: false,

    // Undo / redo stacks (mutated in place, not observed per-element)
    undoStack: [],
    redoStack: [],

    // Toolbar submenu state
    openSubmenu: null,

    // Symbol placement
    pendingSymbolType: null,
    pendingSymbolKey: null,
    symbolClickListener: null,

    // Text placement
    textPlacementMode: false,
    textClickListener: null,

    // Map markers for symbols and text (Google Maps markers, outside Terra Draw)
    markers: [],

    // Currently selected Terra Draw feature
    selectedFeatureId: null,

    // Line type overlay polylines keyed by feature ID
    lineOverlays: {},

    // Line type per feature ID (e.g., { 'abc123': 'dashed' })
    featureLineTypes: {},

    // MGRS grid
    mgrsGridVisible: true,
    mgrsGridLines: [],
    mgrsGridLabels: [],
    mgrsGridScale: 1000,
    mgrsGridColor: '#000000',
    mgrsGridWeight: 2,

    // Map display
    mapBaseType: 'terrain',
    showRoads: true,
    showLabels: true,
    citiesOnly: false,

    // Export pending callback
    exportCallback: null,
};

// ===== Reactive Store =====

/** @type {Map<string, Set<Function>>} */
const listeners = new Map();

// The actual state data (shallow clone of initialState)
const data = Object.assign({}, initialState);

/**
 * Get a state value by key.
 * @param {string} key
 * @returns {*}
 */
export function get(key) {
    return data[key];
}

/**
 * Set a state value and notify subscribers of that key.
 * @param {string} key
 * @param {*} value
 */
export function set(key, value) {
    const prev = data[key];
    data[key] = value;
    notify(key, value, prev);
}

/**
 * Batch-update multiple keys. Notifications fire after all values are written.
 * @param {Object} updates - e.g. { lineColor: '#00F', fillColor: '#0F0' }
 */
export function update(updates) {
    const changed = [];
    for (const [key, value] of Object.entries(updates)) {
        const prev = data[key];
        data[key] = value;
        changed.push([key, value, prev]);
    }
    for (const [key, value, prev] of changed) {
        notify(key, value, prev);
    }
}

/**
 * Subscribe to changes on one or more state keys.
 * @param {string|string[]} keys - Key(s) to watch
 * @param {Function} callback - fn(newValue, oldValue, key)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(keys, callback) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
        if (!listeners.has(key)) {
            listeners.set(key, new Set());
        }
        listeners.get(key).add(callback);
    }
    return function unsubscribe() {
        for (const key of keyList) {
            const subs = listeners.get(key);
            if (subs) subs.delete(callback);
        }
    };
}

/**
 * Notify all subscribers of a key change.
 * @param {string} key
 * @param {*} value
 * @param {*} prev
 */
function notify(key, value, prev) {
    const subs = listeners.get(key);
    if (!subs) return;
    for (const fn of subs) {
        try {
            fn(value, prev, key);
        } catch (err) {
            console.error(`[state] subscriber error for "${key}":`, err);
        }
    }
}

// Expose the full data object for read-only iteration by modules that need it
// (e.g., undo snapshots that read markers array). Modules should prefer get().
export { data as state };
