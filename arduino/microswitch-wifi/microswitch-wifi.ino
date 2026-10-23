
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiUdp.h>

// ================================
// WIFI
// ================================
// const char* ssid = "DE-YAN Wifi";
// const char* password = "Gkrsd34982!";

const char* ssid = "NETGEAR34";
const char* password = "thirstybox961";

// ================================
// UDP
// ================================
// IPAddress pcIP(192, 168, 128, 120);
IPAddress pcIP(192, 168, 1, 6);
const int pcPort = 41234;

WiFiUDP udp;

// ================================
// MICRO SWITCH
// ================================
const int luggagePin = D2;

const unsigned long DEBOUNCE_MS = 10;
const unsigned long RECONNECT_MS = 5000;

int rawState;
int stableState;

unsigned long lastRawChange = 0;
unsigned long lastReconnectAttempt = 0;

bool wasConnected = false;

// ================================
// UDP REPEAT SETTINGS
// ================================
// 1 immediate + 3 additional sends
const int UDP_SEND_COUNT = 4;
const unsigned long UDP_SEND_INTERVAL = 300;

int pendingStatus = 0;
int sendsRemaining = 0;

unsigned long lastUdpSend = 0;

// ================================
// SEND UDP
// ================================
void sendLuggageStatus(int status) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi offline, UDP skipped");
    return;
  }

  char message[32];

  snprintf(
    message,
    sizeof(message),
    "luggage status: %d",
    status
  );

  unsigned long start = millis();

  if (!udp.beginPacket(pcIP, pcPort)) {
    Serial.println("UDP beginPacket failed");
    return;
  }

  udp.print(message);

  int result = udp.endPacket();

  Serial.print("UDP sent: ");
  Serial.print(message);

  Serial.print(" | result: ");
  Serial.print(result);

  Serial.print(" | elapsed: ");
  Serial.print(millis() - start);
  Serial.println(" ms");
}

// ================================
// START REPEATED UDP SEND
// ================================
void startRepeatedSend(int status) {

  // Cancel previous pending sends
  pendingStatus = status;

  // Send immediately
  sendLuggageStatus(pendingStatus);

  // Schedule 3 additional sends
  sendsRemaining = UDP_SEND_COUNT - 1;

  lastUdpSend = millis();
}

// ================================
// PROCESS REPEATED UDP SEND
// ================================
void processRepeatedSend() {

  if (sendsRemaining <= 0) {
    return;
  }

  unsigned long now = millis();

  if (now - lastUdpSend >= UDP_SEND_INTERVAL) {

    sendLuggageStatus(pendingStatus);

    sendsRemaining--;

    lastUdpSend = millis();
  }
}

// ================================
// SETUP
// ================================
void setup() {

  Serial.begin(115200);

  // COM -> GND, NO -> D2
  pinMode(luggagePin, INPUT_PULLUP);

  rawState = digitalRead(luggagePin);
  stableState = rawState;

  pendingStatus = stableState;

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  // Start WiFi without blocking
  WiFi.begin(ssid, password);

  Serial.println("System started");
}

// ================================
// LOOP
// ================================
void loop() {

  unsigned long now = millis();

  // ------------------------------
  // 1. READ SWITCH FIRST
  // ------------------------------
  int reading = digitalRead(luggagePin);

  if (reading != rawState) {
    rawState = reading;
    lastRawChange = now;
  }

  if (rawState != stableState &&
      now - lastRawChange >= DEBOUNCE_MS) {

    stableState = rawState;

    Serial.print("SWITCH changed: ");
    Serial.print(stableState);

    Serial.print(" | millis: ");
    Serial.println(now);

    // Send 4 times, 300ms apart
    startRepeatedSend(stableState);
  }

  // ------------------------------
  // 2. PROCESS UDP REPEATS
  // ------------------------------
  processRepeatedSend();

  // ------------------------------
  // 3. WIFI STATUS
  // ------------------------------
  bool connected =
    WiFi.status() == WL_CONNECTED;

  if (connected && !wasConnected) {

    Serial.println("WiFi connected!");

    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());

    // Synchronize current switch state
    // Also send 4 times
    startRepeatedSend(stableState);
  }

  if (!connected && wasConnected) {
    Serial.println("WiFi disconnected");
  }

  wasConnected = connected;

  // ------------------------------
  // 4. NON-BLOCKING RECONNECT
  // ------------------------------
  if (!connected &&
      now - lastReconnectAttempt >= RECONNECT_MS) {

    lastReconnectAttempt = now;

    Serial.println("Reconnecting WiFi...");
    WiFi.reconnect();
  }

  delay(2);
}
