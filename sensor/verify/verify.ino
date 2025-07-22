#include <Adafruit_Fingerprint.h>

int pin_TX = 5;  // D1
int pin_RX = 14; // D5
SoftwareSerial mySerial(pin_TX, pin_RX);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("Adafruit Fingerprint sensor verification");

  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
    Serial.print("Number of stored templates: ");
    Serial.println(finger.templateCount);
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }
}

void loop() {
  Serial.println("Place finger on sensor...");
  int result = getFingerprintID();
  if (result >= 0) {
    Serial.print("VERIFY_SUCCESS:"); Serial.print(result); Serial.println(":OK");
  } else {
    Serial.println("No match or error");
  }
  delay(2000);
}

int getFingerprintID() {
  uint8_t p = FINGERPRINT_NOFINGER;
  unsigned long startTime = millis();
  const unsigned long timeout = 15000;

  Serial.println("Waiting for finger...");
  while (p != FINGERPRINT_OK && (millis() - startTime) < timeout) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK: Serial.println("Image taken"); break;
      case FINGERPRINT_NOFINGER: Serial.print("."); delay(500); break;
      case FINGERPRINT_PACKETRECIEVEERR: Serial.println("Communication error"); return -1;
      case FINGERPRINT_IMAGEFAIL: Serial.println("Imaging error"); return -1;
      default: Serial.println("Unknown error"); return -1;
    }
  }

  if (p != FINGERPRINT_OK) {
    Serial.println("\nTimeout: No finger detected");
    return -1;
  }

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.println("Image conversion failed");
    return -1;
  }

  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("Found a match!");
    return finger.fingerID;
  } else {
    Serial.println("No match found");
    return -1;
  }
}