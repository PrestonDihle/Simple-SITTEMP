# Simple-SITTEMP

Simple SITTEMP is an interactive military mapping tool built on top of Google Maps. It provides a user-friendly interface for creating, manipulating, and analyzing tactical situations using military map symbols and markup.

## Features

- Interactive Google Maps interface
- Custom military map symbols
- Military markup symbols for tactical drawings
- Drawing tools for tactical overlays
- MGRS (Military Grid Reference System) coordinate display
- MGRS grid overlay
- Color selection for symbols and overlays
- Marker and shape deletion functionality

## Usage

1. Select a marker type or markup symbol from the icon buttons.
2. Choose a color from the color picker.
3. Click on the map to place markers or use the drawing tools to create shapes and markup.
4. Use the delete buttons to remove markers, shapes, or markup as needed.
5. The coordinate display shows both Lat/Lon and MGRS coordinates as you move the mouse over the map.

## Installation

1. Clone this repository.
2. Replace `YOUR_API_KEY` in the HTML file with your Google Maps API key.
3. Open `index.html` in a web browser.

## Dependencies

- Google Maps JavaScript API
- Custom marker types and markup symbols (defined in `markerTypes.js`)
- MGRS conversion library (`mgrs.js`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
