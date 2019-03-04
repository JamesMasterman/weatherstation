#pragma once
#include "application.h"
#include "UDPCommunicator.h"


const unsigned long SEND_DELAY = 3000;

class SensorBase
{
public:
  SensorBase(int stationID);

public:
  int getStationID();
  void setLink(UDPCommunicator* link);

protected:
  void doPublish(uint8_t messageType, char* message, uint8_t len);

protected:
  uint8_t mStationID;
  uint8_t mCurrentRecord;

private:
  UDPCommunicator* mLink;
};
