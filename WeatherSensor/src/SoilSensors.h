#pragma once

#include "application.h"
#include "SensorBase.h"
#include "PinIDs.h"


#define SOIL_EVENT "SOIL_EVENT"

struct SoilRecord{
  time_t  time;
  uint8_t moisturePerc;
  float   temperature;
};

class SoilSensors: public SensorBase
{
public:
  SoilSensors(int stationID);
  ~SoilSensors();

  void setup();

  void sample();
  void publish();

  int getSoilMoisturePercent();
  int getSoilReading();
  float getSoilTemperature();

private:
  int convertSampleToPercent(int sample);

  void sampleMoisture();
  void sampleTemperature();

private:
  uint8_t mSoilMoisturePercent;
  int mSoilMoistureReading;
  float mSoilTemperature;

  SoilRecord** mRecords;

};
