# Playground code for getting all available serial ports
import serial
import serial.tools.list_ports


all_ports = serial.tools.list_ports.comports()
available_ports = []
for i in all_ports:
    print(i.name)
    print(i.device)
    print(i.description)
