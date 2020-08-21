#include <OSCMessage.h>
#include <WiFi.h>

namespace connectivity {
WiFiUDP udp;

// forward declare
bool sendPing();

// values
const char *ssid = "tinmarphone";
const char *password = "tinmarphone74";
std::string uid;
unsigned long lastPingTime = 0;

const IPAddress udpAddress(230, 1, 1, 1);
const int udpPort = 4000;
bool connected = false;
const int ledPin = 3;

// wifi event handler
void WiFiEvent(WiFiEvent_t event) {
  switch (event) {
  case SYSTEM_EVENT_STA_GOT_IP:
    // When connected set
    Serial.print("WiFi connected! IP address: ");
    Serial.println(WiFi.localIP());
    // initializes the UDP state
    // This initializes the transfer buffer
    udp.beginMulticast(udpAddress, udpPort);
    digitalWrite(ledPin, HIGH);
    connected = true;
    sendPing();
    break;
  case SYSTEM_EVENT_STA_DISCONNECTED:
    Serial.println("WiFi lost connection");
    connected = false;
    digitalWrite(ledPin, LOW);
    break;
  }
}
void connectToWiFi() {

  // delete old config
  WiFi.disconnect(true);
  delay(500);
  Serial.print("Tentative de connexion...");
  WiFi.begin(ssid, password);
}
void setup(const std::string &_uid) {
  uid = _uid;
  delay(1000);
  Serial.println("\n");
  WiFi.mode(WIFI_STA);
  delay(100);

  // register event handler
  WiFi.onEvent(WiFiEvent);

  connectToWiFi();
}

bool handleConnection() {
  if (!connected) {
    // for (int i = 0 ; i < 1; i++) {
    // 	delay(2000);
    // 	digitalWrite(ledPin, !digitalRead(ledPin));
    // }

    connectToWiFi();

    int maxAttempt = 100;
    while (WiFi.status() != WL_CONNECTED) {
      Serial.print(".");
      delay(100);
      maxAttempt--;
      if (maxAttempt < 0) {
        break;
      }
    }
  }
  sendPing();
  return connected;
}
void sendOSC(const char *addr, int id, int val) {

  OSCMessage msg(addr);
  msg.add(uid.c_str());
  msg.add((int)id);
  msg.add((int)val);

  udp.beginMulticastPacket();
  msg.send(udp);
  udp.endPacket();
  Serial.println("sending" + String(addr) + " " + String(val));
}

bool sendPing() {
  if (!connected) {
    return false;
  }
  auto time = millis();
  int pingTime = 3000;
  if ((time - lastPingTime) > pingTime) {
    sendOSC("/ping", time, pingTime);
    lastPingTime = time;
    return true;
  }
  return false;
}

std::string getMac() {
  uint8_t mac_id[6];
  esp_efuse_mac_get_default(mac_id);
  char esp_mac[13];
  sprintf(esp_mac, "%02x%02x%02x%02x%02x%02x", mac_id[0], mac_id[1], mac_id[2],
          mac_id[3], mac_id[4], mac_id[5]);
  return std::string(esp_mac);
}

} // namespace connectivity