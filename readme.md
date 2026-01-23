# Robot Mercedes

A web-controlled robot project built with Arduino and Flask.

## Project Overview

This project combines Arduino-based hardware control with a web interface to control a robot vehicle. The Raspberry Pi runs a Flask server that communicates with the Arduino via serial connection.

## Features

- Web-based control interface
- Real-time status monitoring
- Serial communication with Arduino
- Responsive dashboard with joystick controls

## Project Structure

```
├── arduino/
│   └── sketch/
│       └── sketch.ino           # Arduino firmware for robot control
├── pi/
│   ├── server.py                # Flask web server
│   ├── Serial_Connection.py     # Serial communication with Arduino
│   ├── static/
│   │   ├── scripts/
│   │   │   ├── index.js         # Main page logic
│   │   │   ├── joy.js           # Joystick control
│   │   │   └── status.js        # Status updates
│   │   └── styles/
│   │       ├── style.css        # Main styles
│   │       └── joy.css          # Joystick styles
│   └── templates/
│       └── index.html           # Web interface
└── requirements.txt             # Python dependencies
```

## Requirements

- Raspberry Pi (or compatible)
- Arduino board
- Python 3.x
- USB connection between Raspberry Pi and Arduino

## Installation

1. **Clone or download the repository**

2. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Upload Arduino sketch:**
   - Open `arduino/sketch/sketch.ino` in Arduino IDE
   - Select your board and port
   - Upload the sketch

4. **Configure serial connection:**
   - Update the serial port in `Serial_Connection.py` if needed

## Usage

Run the Flask server on your Raspberry Pi:

```bash
python pi/server.py
```

Then access the web interface at `http://localhost:5000` (or your Pi's IP address)

## Notes

- Ensure the Arduino is properly connected via USB before starting the server
- Update the serial port settings in `Serial_Connection.py` to match your setup
