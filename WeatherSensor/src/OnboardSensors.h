#pragma once

#include "application.h"
#include "SparkFun_Photon_Weather_Shield_Library.h"
#include "SensorBase.h"

#define TEMP_PRESS_EVENT "TEMP_PRESS_READING"

struct OnboardRecord{
  time_t time;
  float temperature;
  float humidity;
  float pressure;
};

class OnboardSensors: public SensorBase
{

public:
  OnboardSensors(int stationID);
  ~OnboardSensors();

public:
  void setup();
  void sample();

  void reset();

  float getCurrentTemp();
  float getCurrentHumidity();
  float getCurrentPressure();

  void publish();

private:
  Weather sensor;
  OnboardRecord** mRecords;
  float mTemperature;
  float mHumidity;
  float mPressure;

};
