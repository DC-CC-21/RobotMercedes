#include <string.h>

#define HEADLIGHT_PIN 6
#define TAILLIGHT_PIN 9
#define LIGHTBAR_PIN 11
#define MAX_BRIGHTNESS 250

// Commands
String cmd = "";
#define MAX_CMD_LENGTH 30
char line[MAX_CMD_LENGTH];

void setup() {
  Serial.begin(19200);
  pinMode(HEADLIGHT_PIN, OUTPUT);
}

void ReadLine() {
  // Set the current byte index
  static byte idx = 0;

  // While the serial connection is available read the bytes
  while (Serial.available()) {
    // Get the current character
    char current_char = Serial.read();

    if (current_char == '\n') {
      // If the current character is a newline, reset the line, current character index, and run the command
      line[idx] = "\0";
      idx = 0;
      RunCommand(line);
    } else if (idx < MAX_CMD_LENGTH - 1) {
      // If we are less than the max character count, add the character to our char array
      line[idx++] = current_char;
    }
  }
}

void RunCommand(char* cmd) {
  // Get a set of characters before the first space
  char* op = strtok(cmd, " ");
  if (!op) return;

  // Get the next set of characters before a space starting from where we left off
  char* value = strtok(NULL, " ");
  if (!value) return;

  double percentage = atof(value) / 100;
  int brightness = constrain(percentage * MAX_BRIGHTNESS, 0, MAX_BRIGHTNESS);


  if (op[0] == 'F') {
    // Do something with front lights
    analogWrite(HEADLIGHT_PIN, brightness);
  } else if (op[0] == 'L') {
    analogWrite(LIGHTBAR_PIN, brightness);
    // Do something with offroad light bar
  } else if (op[0] == 'T') {
    analogWrite(TAILLIGHT_PIN, brightness);
    // Do something with tail lights
  } else {
    // Turn all lights off
    analogWrite(HEADLIGHT_PIN, 0);
    analogWrite(TAILLIGHT_PIN, 0);
    analogWrite(LIGHTBAR_PIN, 0);
  }
}

void loop() {
  ReadLine();
}