import gpiozero

cpu_temp = gpiozero.CPUTemperature()

print(cpu_temp.temperature)