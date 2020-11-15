#include <Arduino.h>

#include "./lib/connectivity.hpp"
#include <string>

std::string getUID() {
#if 0
return connectivity::getMac();
#else
  return "0";
#endif
}

std::string myOSCID = getUID();
std::vector<int> sensePins{23, 19};
const int numSenses = sensePins.size();
std::vector<int> vals;

void setup() {
  delay(1000);
  Serial.begin(115200);
  vals.resize(numSenses);
  for (int i = 0; i < numSenses; i++) {
    pinMode(sensePins[i], INPUT);
    // sets3v3 near input pin
    pinMode(sensePins[i] - 1, OUTPUT);
    digitalWrite(sensePins[i]-1,HIGH);
    vals[i] = 0;
  }

  connectivity::setup(myOSCID);
}

void loop() {
#if 0
  Serial.println(analogRead(sensePins[0]));
  delay(10);
#else
  if (connectivity::handleConnection()) {
    for (int i = 0; i < numSenses; i++) {
      int sensePin = sensePins[i];
      int nVal = digitalRead(sensePin);
          digitalWrite(sensePins[i]-1,HIGH);
      if (nVal != vals[i]) {
        vals[i] = nVal;
        if (nVal > 0) {
          connectivity::sendOSC("/sense", i, nVal);
        }
      }
    }
  }
  delay(10);
#endif
}
