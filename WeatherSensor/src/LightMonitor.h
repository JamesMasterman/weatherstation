#pragma once
#include "application.h"
#include "SensorBase.h"
#include "UDPCommunicator.h"


struct LightRecord{
  time_t time;
  int lightPercent;
};

class LightMonitor: public SensorBase
{
  public:
    LightMonitor(int stationID);
    ~LightMonitor();
    void setup();
    void sample();
    int getLightStrength();
    int getLightStrengthPercent();

  public:
    void publish();

  private:
    LightRecord** mRecords;
    int mLightValue=0;
    int mPercent = 0;
};
