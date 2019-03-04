#include "LightMonitor.h"
#include "MySQLFormats.h"
#include "WeatherPacket.h"
#include "PinIDs.h"

const int FULL_SUN = 2550;
const int NIGHT = 20;

const int MAX_RECORDS = 60;

LightMonitor::LightMonitor(int stationID):SensorBase(stationID)
{
  mRecords = new LightRecord*[MAX_RECORDS];
  for(int i=0;i<MAX_RECORDS;i++){
    mRecords[i] = new LightRecord();
  }
}

LightMonitor::~LightMonitor()
{
  for(int i=0;i<mCurrentRecord;i++){
    delete mRecords[i];
  }
  delete[] mRecords;
}

void LightMonitor::setup()
{
  pinMode(PHOTO_VALUE, INPUT);
  pinMode(PHOTO_POWER, OUTPUT);
  digitalWrite(PHOTO_POWER, HIGH);
}

void LightMonitor::publish(){
  char result[DATA_BUFFER_SIZE];

  for(int i=0;i<mCurrentRecord;i++){
    memset(result, 0, DATA_BUFFER_SIZE);
    sprintf(result, "{ \"time\":\"%s\", \"station\": %d, \"lightPercent\": %d}",
             Time.format(mRecords[i]->time, MYSQL_DATE).c_str(),
             getStationID(),
             mRecords[i]->lightPercent);

    doPublish(LIGHT_PACKET, result, DATA_BUFFER_SIZE);
  }

  mCurrentRecord = 0;
}

void LightMonitor::sample()
{
  mLightValue = analogRead(PHOTO_VALUE);
  getLightStrengthPercent();

  //Save to our buffer until next upload
  if(mCurrentRecord < MAX_RECORDS){
    LightRecord* nextRecord = mRecords[mCurrentRecord];
    nextRecord->time = Time.now();
    nextRecord->lightPercent = mPercent;
    mCurrentRecord++;
  }else{
    mCurrentRecord = 0;
  }
}

int LightMonitor::getLightStrength()
{
  return mLightValue;
}

int LightMonitor::getLightStrengthPercent()
{
  mPercent = 0;
  mPercent = (mLightValue-NIGHT)*100/(FULL_SUN-NIGHT);

  if(mPercent > 100)
    mPercent = 100;

  if (mPercent < 0)
    mPercent = 0;

  return mPercent;
}
