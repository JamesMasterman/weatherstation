#include "RainSensor.h"
#include "MySQLFormats.h"
#include "WeatherPacket.h"
#include "PinIDs.h"

const float MM_PER_SWITCH = 0.2794; //mm of rain per tick of the sensor
const int MAX_RECORDS = 10;
RainSensor::RainSensor(int stationID): SensorBase(stationID)
{
  mRainToday = 0;
  mRain1Hour = 0;
  mCurrentHour = Time.hour(Time.now());
  mRecords = new RainRecord*[MAX_RECORDS];
  for(int i=0;i<MAX_RECORDS;i++){
    mRecords[i] = new RainRecord();
  }
}

RainSensor::~RainSensor()
{
  for(int i=0;i<mCurrentRecord;i++){
    delete mRecords[i];
  }

  delete[] mRecords;
}

void RainSensor::reset()
{
  //If we haven't sampled rollover hour, do it now
  sample();
  mRainToday = 0;
  mRain1Hour = 0;
}

void RainSensor::setup()
{
  mLastRainIRQ = 0;
  pinMode(RAIN_PIN, INPUT_PULLUP); // input from rain gauge sensor
}

void RainSensor::rainIRQ()
{
  unsigned long raintime = millis(); // grab current time
  unsigned long raininterval = raintime - mLastRainIRQ; // calculate interval between this and last event

  if (raininterval > 10) // ignore switch-bounce glitches less than 10mS after initial edge
  {
    mRainToday += MM_PER_SWITCH; //Each dump is 0.011" of water
    mRain1Hour += MM_PER_SWITCH; //Increase this hour's amount of rain

    mLastRainIRQ = raintime; // set up for next event
  }
}

void RainSensor::sample()
{
    int hour = Time.hour(Time.now());
    if(hour != mCurrentHour)
    {
      if(mCurrentRecord < MAX_RECORDS){
        RainRecord* nextRecord = mRecords[mCurrentRecord];
        nextRecord->time = Time.now();
        nextRecord->rainToday = mRainToday;
        nextRecord->rainLastHr = mRain1Hour;
        mCurrentRecord++;
      }else{
        mCurrentRecord = 0;
      }

      mRain1Hour = 0;
      mCurrentHour = hour;
    }
}

void RainSensor::publish()
{
  char result[DATA_BUFFER_SIZE];
  for(int i=0;i<mCurrentRecord;i++){
    memset(result, 0, DATA_BUFFER_SIZE);
    sprintf(result, "{ \"time\":\"%s\", \"station\": %d, \"lasthr\":%.2f, \"today\":%.2f }",
            Time.format(mRecords[i]->time, MYSQL_DATE).c_str(),
            getStationID(),
            mRecords[i]->rainLastHr,
            mRecords[i]->rainToday);

    doPublish(RAIN_PACKET, result, DATA_BUFFER_SIZE);
  }
  mCurrentRecord = 0;
}

float RainSensor::getRainToday()
{
    return mRainToday;
}

float RainSensor::getRainLastHour()
{
    return mRain1Hour;
}
