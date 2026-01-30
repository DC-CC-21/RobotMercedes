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
print("Available port: ")
print([i.device for i in all_ports])

motor_port = "/dev/ttyACM0"
Serial = sc.Serial_Connection(19200, motor_port, "motor port")
# Serial.begin(19200, port=motor_port)

light_port = "/dev/ttyUSB0"
Serial_Lights = sc.Serial_Connection(19200, light_port, "light port")
# Serial.begin(19200, port=light_port)


prev_velocity = 0
millis = -1
lights_on = False


# ========== Routes ========== #
@app.route("/")
def index():
    return render_template("index.html", title="Pi Server")

# ========== Socket Routes ========== #
@socketio.on("connect")
def handle_connect():
    print("Client connected")
    socketio.emit("ports", {"ports": [i.device for i in all_ports]})


@socketio.on("joystick_data")
def handle_joy1(data):
    global prev_velocity, millis

    x = int(data.get("j1", 0) * 100)
    y = int(data.get("j2", 0) * 100)
    Serial.write(f"M {x} {-y}")

    # if the vehicle is slowing down and the vehicle was not stopped or in reverse,
    # set the tail lights to full power
    if y < prev_velocity and prev_velocity > 0:
        print("Brake!!!")
        Serial_Lights.write("T 100")
        millis = time.time()
    else:
        Serial_Lights.write(f"T {30 if lights_on else 0}")
    # update prev velocity to current velocity
    prev_velocity = max(y,0)

@socketio.on("lights") 
def toggle_lights(data):
    global lights_on
    lights_on = bool(data.get("lights_on"))
    print(lights_on)

    if lights_on:
        Serial_Lights.write("F 100")
        Serial_Lights.write("T 30")
    else: 
        Serial_Lights.write("F 0")
        Serial_Lights.write("T 0")

@socketio.on("lightbar") 
def toggle_lights(data):
    lightbar_on = bool(data.get("lightbar_on"))

    if lightbar_on:
        Serial_Lights.write("L 100")
    else:
        Serial_Lights.write("L 0")

# ========== Background Tasks ========== #
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
            Serial.begin(19200, port=motor_port)
            socketio.emit(
                "arduino_status",
                {"connected": Serial.communication_status},
            )
            socketio.sleep(5)


def sensor_data():
    global millis

    print("Sensor Socket Started")
    while True:
        try:
            if (time.time() - millis)*1000 > 1000 and millis >= 0:
                print("OFF")
                millis = -1
                Serial_Lights.write(f"T {30 if lights_on else 0}")

            Serial.write("S")
            data = Serial.read().split(" ")

            [_, ax, ay, az, gx, gy, gz] = data

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
        except Exception as e:
            print(e)
        time.sleep(0.1)


# ========== Main ========== #
def main():
    socketio.start_background_task(target=pi_temp)
    socketio.start_background_task(target=arduino_status)
    socketio.start_background_task(target=sensor_data)
    socketio.run(app, host="0.0.0.0", port=5050, debug=False)


if __name__ == "__main__":
    main()
