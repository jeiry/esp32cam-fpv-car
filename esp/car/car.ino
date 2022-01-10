#include "WiFi.h"
#include "esp_camera.h"
#include "config.h"
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
//#include <SocketIOclient.h>
// Pin definition for CAMERA_MODEL_AI_THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

StaticJsonDocument<200> doc;

WebSocketsClient webSocket;

String chipId;
bool beeRun = false;
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

  if (type == WStype_DISCONNECTED) {
    Serial.printf("[WSc] Disconnected!\n");
    digitalWrite(12, 0);
    digitalWrite(13, 0);
    digitalWrite(15, 0);
    digitalWrite(14, 0);
  } else if (type == WStype_CONNECTED) {
    Serial.printf("[WSc] Connected to url: % s\n", payload);
    webSocket.sendTXT(" {\"action\":\"login\",\"username\":\"" + String(wusername) + "\",\"password\":\"" + String(wpassword) + "\",\"type\":\"cam\"}");
  } else if (type == WStype_TEXT) {
    Serial.printf("[WSc] get text: %s\n", payload);

    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    } else {
      const char* action = doc["action"]; // "action"

      if (strcmp(action, "action") == 0) {
        const char* left = doc["left"];
        const char* right = doc["right"];
        Serial.println(action);
        Serial.println(left);
        Serial.println(right);
        if (strcmp(left, "forward") == 0) {
          Serial.println("--------------");
          digitalWrite(12, 1);
          digitalWrite(13, 0);
        } else if (strcmp(left, "backward") == 0) {
          digitalWrite(12, 0);
          digitalWrite(13, 1);
        } else if (strcmp(left, "stop") == 0) {
          digitalWrite(12, 0);
          digitalWrite(13, 0);
        }

        if (strcmp(right, "forward") == 0) {
          digitalWrite(15, 0);
          digitalWrite(14, 1);
        } else if (strcmp(right, "backward") == 0) {
          digitalWrite(15, 1);
          digitalWrite(14, 0);
        } else if (strcmp(right, "stop") == 0) {
          digitalWrite(15, 0);
          digitalWrite(14, 0);
        }
      }
      if (strcmp(action, "led4") == 0) {
        const char* cmd = doc["cmd"];
        if (strcmp(cmd, "on") == 0) {
          digitalWrite(4, 1);
        }
        else if (strcmp(cmd, "off") == 0) {
          digitalWrite(4, 0);
        }
      } else if (strcmp(action, "bee") == 0) {
        const char* cmd = doc["cmd"];
        if (strcmp(cmd, "on") == 0) {
          beeRun = true;
          //          digitalWrite(2, 1);
          //          delay(300);
          //          digitalWrite(2, 0);
        }
      }

    }

  } else if (type == WStype_BIN) {
    Serial.printf("[WSc] get binary length: %u\n", length);
  } else if (type == WStype_PING) {
    Serial.printf("[WSc] get ping\n");
  } else if (type == WStype_PONG) {
    Serial.printf("[WSc] get pong\n");
  }

}

void setupCamera()
{

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  config.frame_size = FRAMESIZE_VGA; // FRAMESIZE_ + QVGA|CIF|VGA|SVGA|XGA|SXGA|UXGA
  config.jpeg_quality = 10;
  config.fb_count = 1;

  // Init Camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

}

void setup() {
  Serial.begin(115200);
  chipId = String((uint32_t)ESP.getEfuseMac(), HEX);
  chipId.toUpperCase();

  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  pinMode(15, OUTPUT);
  pinMode(14, OUTPUT);

  pinMode(4, OUTPUT);
  pinMode(2, OUTPUT);


  pinMode(33, OUTPUT);

  digitalWrite(12, 0);
  digitalWrite(13, 0);
  digitalWrite(15, 0);
  digitalWrite(14, 0);
  digitalWrite(16, 0);
  digitalWrite(33, LOW);

  WiFi.begin(String(ssid).c_str(), String(wifipw).c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());


  setupCamera();

}
unsigned long messageTimestamp = 0;
int count = 0;
bool initWifi = false;
int beeRunCount = 0;
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    //      连websocket
    if (initWifi == false) {
      initWifi = true;
      int16_t port = strtol(String(wport).c_str(), NULL, 0);
      webSocket.begin(String(waddr).c_str(), port);
      webSocket.onEvent(webSocketEvent);
      webSocket.setReconnectInterval(5000);
      webSocket.enableHeartbeat(15000, 3000, 2);
    }

    //发mjpeg
    webSocket.loop();

  }

  uint64_t now = millis();

  if (now - messageTimestamp > 30) {
    messageTimestamp = now;

    camera_fb_t * fb = NULL;

    // Take Picture with Camera
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      return;
    }

    webSocket.sendBIN(fb->buf, fb->len);
    esp_camera_fb_return(fb);
  }

  //蜂鸣器
  if (beeRun == true) {
    digitalWrite(2, 1);
    beeRunCount ++;
    if (beeRunCount >= 300) {
      beeRun = false;
      digitalWrite(2, 0);
      beeRunCount = 0;
    }
  }
}
