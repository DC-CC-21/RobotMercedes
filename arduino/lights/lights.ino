#define HEADLIGHT_PIN 12

void setup()
{
}

void loop()
{
    digitalWrite(HEADLIGHT_PIN, HIGH);
    delay(1000);
    digitalWrite(HEADLIGHT_PIN, LOW);
    delay(1000);
}