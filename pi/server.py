import time
import flask_socketio
from flask import Flask, render_template
from random import randint
import Serial_Connection as sc
import serial.tools.list_ports
from gpiozero import CPUTemperature

# Server Setup
app = Flask(__name__)
socketio = flask_socketio.SocketIO(app)

# Serial Connection
all_ports = serial.tools.list_ports.comports()
Serial = sc.Serial_Connection()
Serial.begin(19200, port=all_ports[0].device)


@app.route("/")
def index():
    return render_template("index.html", title="Pi Server")


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    socketio.emit("ports", {"ports": [i.device for i in all_ports]})


@socketio.on("joystick_data")
def handle_joy1(data):
    x = int(data.get("j1", 0) * 100)
    y = int(data.get("j2", 0) * 100)
    Serial.write(f"M {x} {y}")


def pi_temp():
    cpu_temp = CPUTemperature()
    while True:
        socketio.emit("pi_temp", {"temperature": cpu_temp.temperature})
        socketio.sleep(1)


def arduino_status():
    while True:
        if Serial.communication_status:
            # If communication is successful, emit the status to the webpage
            socketio.emit(
                "arduino_status",
                {"connected": Serial.communication_status},
            )
            socketio.sleep(1)
        else:
            # If communication is not successful, restart the serial connection
            Serial.close()
            Serial.begin(19200, port=all_ports[0].device)
            socketio.emit(
                "arduino_status",
                {"connected": Serial.communication_status},
            )
            socketio.sleep(5)


def sensor_data():
    print("Sensor Socket Started")
    while True:
        Serial.write("S")
        data = Serial.read()
        [_, ax, ay, az, gx, gy, gz] = data.split(" ")

        socketio.emit(
            "sensor_data",
            {
                "accelerometer": {
                    "x": ax,
                    "y": ay,
                    "z": az,
                },
                "gyro": {"x": gx, "y": gy, "z": gz},
            },
        )
        time.sleep(0.1)


def main():
    socketio.start_background_task(target=pi_temp)
    socketio.start_background_task(target=arduino_status)
    socketio.start_background_task(target=sensor_data)
    socketio.run(app, host="0.0.0.0", port=5050, debug=False)


if __name__ == "__main__":
    main()
