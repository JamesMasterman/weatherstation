#pragma once
#include "application.h"
#include "SensorBase.h"
#include "PinIDs.h"

#define RAIN_EVENT "RAIN_READING"

struct RainRecord{
  time_t time;
  float rainLastHr;
  float rainToday;
};

class RainSensor: public SensorBase
{
public:
  RainSensor(int stationID);
  ~RainSensor();

public:
  void setup();

  void rainIRQ();
  void sample();
  void publish();

  void reset();

  float getRainToday();
  float getRainLastHour();


private:
  volatile float mRain1Hour; //mm of rain in the last hour. this is the smallest chunk we will support
  volatile float mRainToday; //mm of rain today
  volatile long mLastRainIRQ;
  RainRecord** mRecords;
  int mCurrentHour;

};
