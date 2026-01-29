#include <ArduinoMotorCarrier.h>
#include <Arduino_LSM6DS3.h>
#include <string.h>

#define TOP_SPEED 80  // PWM value for max speed of motors
#define OFFSET_A 1    //Switch to -1 if the motor is running backwards
#define OFFSET_B 1

// Servo
#define SERVO_PIN 13
#define SERVO_MAX 90

String cmd = "";
#define MAX_CMD_LENGTH 30
char line[MAX_CMD_LENGTH];

void setup() {
  Serial.begin(19200);


  if (controller.begin()) {
    Serial.print("Nano Motor Shield connected, firmware version ");
    Serial.println(controller.getFWVersion());
  } else {
    Serial.println("Couldn't connect! Is the red led blinking? You may need to update the firmware with FWUpdater sketch");
  }

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU");
  }

  servo1.setAngle(90);
  M1.setDuty(0);
}

void ReadLine() {
  static byte idx = 0;
  while (Serial.available()) {
    char current_char = Serial.read();

    if (current_char == '\n') {
      line[idx] = '\0';
      idx = 0;
      RunCommand(line);
    } else if (idx < MAX_CMD_LENGTH - 1) {
      line[idx++] = current_char;
    }
  }
}

void RunCommand(char *cmd) {
  char *op = strtok(cmd, " ");
  if (!op) return;

  // ===== Ping: P ===== //
  if (op[0] == 'P') {
    Serial.println("Success");
  }

  // ===== Set motor speed: M <speed1> =====
  else if (op[0] == 'M') {
    // Get the next value after the space
    char *servoStr = strtok(NULL, " ");
    char *motorStr = strtok(NULL, " ");

    // Return if no value was provided
    if (!motorStr) return;

    // Convert the values to an int
    double speedPercentage = atof(motorStr) / 100;
    double servoPositionPercentage = atof(servoStr) / 100;

    // Get the values
    int motorSpeed = constrain(speedPercentage * TOP_SPEED, -TOP_SPEED, TOP_SPEED);
    int servoPosition = constrain(servoPositionPercentage * SERVO_MAX, -SERVO_MAX, SERVO_MAX) + SERVO_MAX;

    // Move the motors/servo
    M1.setDuty(motorSpeed);
    M2.setDuty(motorSpeed);
    servo1.setAngle(servoPosition);
  }

  // ===== Brake: B ===== //
  else if (op[0] == 'S') {
    float ax, ay, az, gx, gy, gz;
    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(ax, ay, az);
    }

    // Read gyroscope
    if (IMU.gyroscopeAvailable()) {
      IMU.readGyroscope(gx, gy, gz);
    }

    // Print Sensor data in the following format:
    // SENSOR ax ay az gx gy gz
    Serial.print("SENSOR ");
    Serial.print(ax, 2);
    Serial.print(" ");
    Serial.print(ay, 2);
    Serial.print(" ");
    Serial.print(az, 2);
    Serial.print(" ");
    Serial.print(gx, 2);
    Serial.print(" ");
    Serial.print(gy, 2);
    Serial.print(" ");
    Serial.print(gz, 2);
    Serial.println(" ");
  }

  // ===== Brake: B ===== //
  if (op[0] == 'B') {
    M1.setDuty(0);
    M2.setDuty(0);
  }
}

void loop() {
  ReadLine();
  controller.ping();
}