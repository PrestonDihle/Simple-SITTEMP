# Simple SITTEMP

**A lightweight, browser-based military mapping tool for building Situational Templates.**

Simple SITTEMP (Situational Template) is an interactive web application that lets military planners place NATO-standard symbols, draw tactical overlays, and work with MGRS coordinates on top of Google Maps. Designed for Army and Marine Corps units as a quick, intuitive alternative to heavier C2 systems during mission planning.

<!-- Screenshot placeholder: Add a screenshot of the application here -->
<!-- ![Simple SITTEMP Screenshot](screenshot.png) -->

## Features

- **Interactive Map** - Google Maps base layer with satellite, terrain, and roadmap views centered on Fort Irwin / NTC
- **NATO Military Symbols** - 18 equipment symbols and 11 unit symbols following APP-6 / MIL-STD-2525 conventions
- **Tactical Drawing** - Draw polygons, rectangles, circles, lines, and freehand shapes with customizable colors and styles
- **Specialty Line Types** - Mine belt, wire obstacle, tank ditch, and standard line patterns (solid, dashed, dotted, dash-dot)
- **MGRS Grid Overlay** - Toggleable grid at 1:50K, 1:100K, and 1:250K scales with easting/northing labels
- **Real-time MGRS Coordinates** - Live cursor position display in both Lat/Lon and MGRS format
- **Right-Click MGRS Copy** - Instantly copy MGRS coordinates to clipboard
- **Export Options** - Export as KML, PDF (multiple page sizes), or PNG screenshot
- **Text Labels** - Place custom text annotations anywhere on the map
- **Undo/Redo** - Full undo/redo support for all map actions
- **Zero Build** - No npm, no bundler, no framework. Just open and use.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrestonDihle/Simple-SITTEMP.git
   cd Simple-SITTEMP
   ```

2. **Add your Google Maps API key**

   Open `index.html` and find this line:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&callback=initMap"></script>
   ```
   Replace `YOUR_API_KEY_HERE` with your Google Maps API key.

   Alternatively, the app will prompt you for your API key on first load and store it in your browser's localStorage.

3. **Open in a browser**

   Simply open `index.html` in any modern web browser, or serve it from any static file server.

## Getting a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an API key
5. (Recommended) Restrict the API key to your domain for security
6. Copy the API key and add it to the application as described above

For detailed instructions, see [Google's official guide](https://developers.google.com/maps/documentation/javascript/get-api-key).

## Deploy to GitHub Pages

1. Push your code to a GitHub repository
2. Go to **Settings > Pages** in your repository
3. Under **Source**, select the branch (e.g., `main`) and folder (`/ (root)`)
4. Click **Save**
5. Your site will be available at `https://yourusername.github.io/Simple-SITTEMP/`

**Note:** Do not commit your Google Maps API key to the repository. Use the localStorage prompt feature or a separate `config.js` file that is listed in `.gitignore`.

## Technology Credits

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) - Base map layer
- [Terra Draw](https://github.com/JamesLMilner/terra-draw) - Drawing interaction engine
- [Terra Draw Google Maps Adapter](https://github.com/JamesLMilner/terra-draw) - Google Maps integration for Terra Draw
- [mgrs (proj4js)](https://github.com/proj4js/mgrs) - MGRS coordinate conversion
- [html2canvas](https://html2canvas.hertzen.com/) - Screen capture for export
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

## Monetization Notice

This application includes placeholder areas for advertisements (banner and interstitial) to help offset Google Maps API costs. The ad placements are non-intrusive and are automatically hidden during screenshot exports.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

For AI-assisted development, see [AI.md](AI.md) for full project context, architecture decisions, and current development state.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**UNCLASSIFIED** - This tool is for unclassified use only. Do not enter or display classified information.
