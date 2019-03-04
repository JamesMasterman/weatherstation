#pragma once
#include "application.h"
#include "SensorBase.h"
#include "PinIDs.h"

#define WIND_EVENT "WIND_READING"

enum WIND_QUADRANT
{
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW
};

struct WindRecord{
  time_t time;
  float avgSpeed;
  float maxSpeed;
  uint16_t bearing;
};

class WindSensor: public SensorBase
{

public:
  WindSensor(int stationID);
  ~WindSensor();

public:
  void setup();
  void  windSpeedIRQ();
  void  sample();
  void  publish();

  float getWindSpeed();
  float getAvgWindSpeed();
  float getMaxWindSpeed();

  uint16_t getWindBearing();
  WIND_QUADRANT getWindQuadrant();

  uint16_t getAvgWindBearing();
  WIND_QUADRANT getAvgWindQuadrant();

  int getvalue();

  void reset();

private:
  WIND_QUADRANT convertBearingToQuadrant(uint16_t bearing);
  uint16_t convertAnalogWindDirectionReadingToBearing(int reading);
  uint16_t convertAnalogWindSpeedReadingToBearing(int reading);
  float calcAverageBearing(float* values, int count, float currentBearing);

private:
  float mCurrWindSpeed;
  uint16_t mCurrWindDir;
  long mLastWindSpeedCheck;

  float mWindSpeedAccumulator;
  uint8_t mWindSampleCount;
  float* mWindDirAccumulator;
  volatile int mWindClicks;
  volatile long mLastWindSpeedIRQ;

  uint16_t mLast5MinAvgWindDir;
  float mLast5MinAvgWindSpeed;
  float mMaxWindSpeed;

  WindRecord** mRecords;

};
