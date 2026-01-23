import flask_socketio
from flask import Flask, render_template
from random import randint
import Serial_Connection as sc

app = Flask(__name__)
socketio = flask_socketio.SocketIO(app)
Serial = sc.Serial_Connection()
Serial.begin(19200, port="COM3")


@app.route("/")
def index():
    return render_template("index.html", title="Pi Server")


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("joystick_data")
def handle_joy1(data):
    x = int(data.get("j1", 0) * 100)
    y = int(data.get("j2", 0) * 100)
    Serial.write(f"M {x} {y}")


def mock_pi_temp():
    while True:
        socketio.emit("pi_temp", {"temperature": randint(30, 90)})
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
            Serial.begin(19200, port="COM4")
            socketio.emit(
                "arduino_status",
                {"connected": Serial.communication_status},
            )
            socketio.sleep(5)


def main():
    socketio.start_background_task(target=mock_pi_temp)
    socketio.start_background_task(target=arduino_status)
    socketio.run(app, host="0.0.0.0", port=5050, debug=False)


if __name__ == "__main__":
    main()
