
#include <SparkFun_TB6612.h>  //motor driver library
#include <Servo.h>
#include <string.h>

#define AIN1 9         // motor driver
#define BIN1 7         // motor driver
#define AIN2 10        // motor driver
#define BIN2 6         // motor driver
#define PWMA 11        // motor driver
#define PWMB 5         // motor driver
#define STBY 8         // motor driver
#define TOP_SPEED 200  // PWM value for max speed of motors
#define OFFSET_A 1     //Switch to -1 if the motor is running backwards
#define OFFSET_B 1

// Servo
#define SERVO_PIN 13
#define SERVO_MAX 90

// set up the drive motors
Motor motor1 = Motor(AIN1, AIN2, PWMA, OFFSET_A, STBY);
Motor motor2 = Motor(BIN1, BIN2, PWMB, OFFSET_B, STBY);

// set up the servo
Servo servoMotor;

String cmd = "";
#define MAX_CMD_LENGTH 30
char line[MAX_CMD_LENGTH];

void setup() {
  digitalWrite(STBY, HIGH);  // Enable the motor driver
  servoMotor.attach(SERVO_PIN);
  servoMotor.write(0);
  Serial.begin(19200);
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

  if (op[0] == 'P') {  // Ping: P
    Serial.println("Success");
  } else if (op[0] == 'M') {  // Set motor speed: M <speed1>
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
    motor1.drive(motorSpeed);
    motor2.drive(motorSpeed);
    servoMotor.write(servoPosition);
  }
  if (op[0] == 'B') {  // Brake: B
    motor1.brake();
    motor2.brake();
  }
}

void loop() {
  ReadLine();
}