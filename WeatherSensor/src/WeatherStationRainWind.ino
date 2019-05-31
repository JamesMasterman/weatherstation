/*
 * Project WeatherStationRainWind
 * Description:
 * Author:
 * Date:
 */

#include "WindSensor.h"
#include "RainSensor.h"
#include "SoilSensors.h"
#include "OnboardSensors.h"
#include "LightMonitor.h"

#define STATION_ID 1

const unsigned long ONE_MIN_MS = 60*1000;
const unsigned long WATCHDOG_TIMEOUT_MS = 15*ONE_MIN_MS; //timeout for watchdog
const unsigned long WIFI_TIMEOUT_MS = 90*1000; //90 second timeout waiting for the wifi
const unsigned long PUBLISH_TIME_MS= 360*ONE_MIN_MS; //Update the cloud every 6 hrs
const unsigned long SEND_TIME_DELAY = 2 * ONE_MIN_MS; //2 min retry if we can't connect to wifi

const unsigned long FAST_LOOP_TIME_MS= 30*1000; //30 seconds for fast loop
const unsigned long SLOW_LOOP_TIME_MS= 10*ONE_MIN_MS;//10 mins for slow loop
const unsigned long REALLY_SLOW_LOOP_TIME_MS = 180*ONE_MIN_MS; //once per three hours for really slow readings (eg soil moisture)

unsigned long loopStart = 0;
unsigned long sendTime = 0;

unsigned long lastSlowLoop = 0;
unsigned long lastVerySlowLoop = 0;
int sendAttempts = 0;
bool sensorsReset = false;

WindSensor* windSensor = new WindSensor(STATION_ID);
RainSensor* rainSensor = new RainSensor(STATION_ID);
SoilSensors* soilSensor = new SoilSensors(STATION_ID);
LightMonitor* lightSensor = new LightMonitor(STATION_ID);
OnboardSensors* onboardSensors = new OnboardSensors(STATION_ID);
UDPCommunicator* udp = new UDPCommunicator();

void windSpeedInterrupt()
{
  windSensor->windSpeedIRQ();
}

void rainInterrupt()
{
  rainSensor->rainIRQ();
}

/**
 * Publishes all the results from all sensors to the server
 */
void publishAll()
{
  udp->begin();

  windSensor->setLink(udp);
  rainSensor->setLink(udp);
  soilSensor->setLink(udp);
  lightSensor->setLink(udp);
  onboardSensors->setLink(udp);

  windSensor->publish();
  rainSensor->publish();
  soilSensor->publish();
  lightSensor->publish();
  onboardSensors->publish();

  udp->end();
}

//STARTUP(WiFi.selectAntenna(ANT_INTERNAL));
STARTUP(WiFi.selectAntenna(ANT_EXTERNAL));

SYSTEM_MODE(SEMI_AUTOMATIC);

// EXAMPLE USAGE
// reset the system after 10 mins if the application is unresponsive
ApplicationWatchdog wd(WATCHDOG_TIMEOUT_MS, System.reset);

//---------------------------------------------------------------
void setup()
{
    //Serial.begin(9600);   // open serial over USB at 9600 baud

    onboardSensors->setup();
    rainSensor->setup();
    soilSensor->setup();
    windSensor->setup();
    lightSensor->setup();

    attachInterrupt(WIND_SPEED_PIN, windSpeedInterrupt, FALLING);
    attachInterrupt(RAIN_PIN, rainInterrupt, FALLING);

    //Turn on interrupts
    interrupts();
}

void syncTime()
{
  Time.zone(10.0); //Set the local timezome

  //Sync the time
  WiFi.on();
  WiFi.connect();
  if(waitFor(WiFi.ready, WIFI_TIMEOUT_MS)){
    Particle.connect();
    if(waitFor(Particle.connected, WIFI_TIMEOUT_MS)){

      Particle.process();

      //Make sure the system clock is updated
      Particle.syncTime();
      waitUntil(Particle.syncTimeDone);
    }
  }

  //Turn off the wifi to save power
  Particle.disconnect();
  WiFi.off();
}

//Things to sample every 30 seconds
void fastLoop()
{
  //Sample the wind direction (analog)
  windSensor->sample();

  //sample rain
  rainSensor->sample();
}

//Once per 10 minutes
void slowLoop()
{
  lightSensor->sample();

  //Get readings from all onboard sensors
  onboardSensors->sample();
}

//Once per 2 hours
void verySlowLoop()
{
  soilSensor->sample();
}

void resetIfMidnight(){
  //Reset all the sensors at midnight
  if(Time.hour(Time.now()) == 0 && !sensorsReset)
  {
    windSensor->reset();
    rainSensor->reset();
    sensorsReset = true;
    syncTime();
  }

  //Clear the sensor reset flag in the next hour
  if(sensorsReset && Time.hour(Time.now()) != 0)
  {
    sensorsReset = false;
  }
}

//---------------------------------------------------------------
void loop()
{
      if(sendTime == 0){
        syncTime();
        sendTime = millis();
      }

      resetIfMidnight();

      loopStart = millis();

      //Once per 30 seconds for fast loop
      fastLoop();

      //Once per 10 mins for slow loop
      if((millis() - lastSlowLoop) >= SLOW_LOOP_TIME_MS)
      {
        slowLoop();
        lastSlowLoop = millis();
      }

      //Once per 2hrs hour for very slow loop
      if((millis() - lastVerySlowLoop) >= REALLY_SLOW_LOOP_TIME_MS)
      {
        verySlowLoop();
        lastVerySlowLoop = millis();
      }

      //Publish the results
      if((millis() - sendTime) > PUBLISH_TIME_MS){
        WiFi.on();
        WiFi.connect();
        if(waitFor(WiFi.ready, WIFI_TIMEOUT_MS)){
            sendTime = millis();
            publishAll();
            sendAttempts = 0;
        }else{
          if(sendAttempts < 5){
            sendAttempts++;
            sendTime = millis() - PUBLISH_TIME_MS + SEND_TIME_DELAY*sendAttempts; //try again soon if we cant connect
          }else{
            sendTime = millis() + PUBLISH_TIME_MS;
            sendAttempts = 0;
          }
        }

        //turn off the wifi to save battery
        WiFi.off();

      }else{
        if((millis() - loopStart) < FAST_LOOP_TIME_MS){
          delay(FAST_LOOP_TIME_MS - (millis()-loopStart));
        }else{
          delay(FAST_LOOP_TIME_MS); //handle time rollover events every 49 days
        }
      }

      wd.checkin();

      // Use the printInfo() function to print data out to Serial
      //printInfo();
}

//---------------------------------------------------------------
void printInfo()
{
//This function prints the weather data out to the default Serial Port

 Serial.println(Time.format(Time.now(), TIME_FORMAT_ISO8601_FULL));

Serial.print("Free mem = ");
Serial.println(System.freeMemory());

  Serial.print("Temp:");
  Serial.print(onboardSensors->getCurrentTemp());
  Serial.print("C");

  Serial.print(", Humi:");
  Serial.print(onboardSensors->getCurrentHumidity());
  Serial.print("%, ");

  Serial.print(", Pres:");
  Serial.print(onboardSensors->getCurrentPressure());
  Serial.print("hPa, ");

  Serial.print("light: ");
  Serial.print(lightSensor->getLightStrengthPercent());

  /*Serial.print(", W Speed:");
  Serial.print(windSensor->getWindSpeed());//instantaneous wind Speed
  Serial.print(", Avg W Speed:");
  Serial.print(windSensor->getAvgWindSpeed());//2 min wind Speed

  Serial.print(", W Dir:");
  Serial.print(windSensor->getWindBearing());//instantaneous wind Speed
  Serial.print(", Avg W Dir:");
  Serial.print(windSensor->getAvgWindBearing());//2 min wind Speed*/


  Serial.print(", Rain Last hour:");
  Serial.print(rainSensor->getRainLastHour());//max wind Speed

  Serial.print(", Rain Today:");
  Serial.print(rainSensor->getRainToday());//max wind Speed

  Serial.print(", Soil Moisture: ");
  Serial.print(soilSensor->getSoilMoisturePercent());

  Serial.print(", Soil Temp: ");
  Serial.println(soilSensor->getSoilTemperature());

}
