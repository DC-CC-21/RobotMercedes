import serial
import time
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%m-%d-%Y %H:%M:%S",
)


class Serial_Connection:
    _baudrate = 9600
    _timeout = 1

    connection_established = False
    communication_status = False

    def __init__(self) -> None:
        try:
            logging.info("Initializing serial connection...")
            self._serial = serial.Serial()
            time.sleep(2)
            logging.info("Serial connection successful")
            self.connection_established = True
        except Exception as e:
            logging.error(f"Error initializing serial connection: {e}")

    def begin(self, baudrate, timeout=_timeout, port="COM3"):
        logging.info("Updating serial parameters...")
        try:
            self._baudrate = baudrate
            self._serial.baudrate = self._baudrate
            self._serial.timeout = timeout
            self._serial.port = port
            self._serial.open()
        except Exception as e:
            logging.error(f"Error updating serial parameters: {e}")
            return

        logging.info("Checking communication with Arduino...")
        time.sleep(2)
        self.write("P")  # Ping the Arduino to test the connection

        response = self.read()
        if response == "Success":
            logging.info("Communication with Arduino successful")
            self.communication_status = True
        else:
            logging.error(
                f"Communication with Arduino failed. Received: ({response})"
            )

    def write(self, data: str):
        if self._serial.is_open:
            try:
                self._serial.write(f"{data}\n".encode())
            except Exception:
                logging.error("Error writing data to serial port.")
                self.communication_status = False

    def read(self) -> str:
        if self._serial.is_open:
            value = None
            value = self._serial.readline().decode().strip()
            # while value is None or value == "":
            return value
        return "No data - Serial port is not open."

    def close(self):
        if self._serial.is_open:
            self._serial.close()
            logging.info("Serial connection closed.")


def main():
    Serial = Serial_Connection()
    Serial.begin(19200, port="COM4")

    while True:
        value = input("Enter a command and a value: ")
        Serial.write(value)


if __name__ == "__main__":
    main()
