#include "SensorBase.h"

SensorBase::SensorBase(int stationID)
{
  mStationID = stationID;
  mCurrentRecord = 0;
  mLink = NULL;
}


int SensorBase::getStationID()
{
  return mStationID;
}

void SensorBase::doPublish(uint8_t messageType, char* message, uint8_t len)
{
  if(mLink != NULL)
  {
    mLink->publish(mStationID, messageType, message, strlen(message));
  }
}

void SensorBase::setLink(UDPCommunicator* link)
{
  mLink = link;
}
