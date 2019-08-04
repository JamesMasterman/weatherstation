#include "WindSensor.h"
#include "MySQLFormats.h"
#include "math.h"
#include "PinIDs.h"
#include "WeatherPacket.h"

#define PI 3.14159f

const int WIND_ACCUM_SIZE = 10;
const int MAX_RECORDS = 144;
WindSensor::WindSensor(int stationID): SensorBase(stationID)
{
  mWindDirAccumulator = new float[WIND_ACCUM_SIZE];
  mRecords = new WindRecord*[MAX_RECORDS];
  for(int i=0;i<MAX_RECORDS;i++){
    mRecords[i] = new WindRecord();
  }

  reset();
}

WindSensor::~WindSensor()
{
    delete[] mWindDirAccumulator;

    for(int i=0;i<mCurrentRecord;i++){
      delete mRecords[i];
    }

    delete[] mRecords;
}


void WindSensor::windSpeedIRQ()
{
  if (millis() - mLastWindSpeedIRQ > 10) // Ignore switch-bounce glitches less than 10ms after the reed switch closes
  {
    mLastWindSpeedIRQ = millis(); //Grab the current time
    mWindClicks++; //There is 2.4km/hr for each click per second.
  }
}

void WindSensor::setup()
{
  pinMode(WIND_SPEED_PIN, INPUT_PULLUP); // input from wind meters windspeed sensor
}


void WindSensor::sample()
{
  float deltaTime = millis() - mLastWindSpeedCheck;
  deltaTime /= 1000.0; //Convert to seconds

  mCurrWindSpeed = (float)mWindClicks / deltaTime;

  mWindClicks = 0; //Reset and start watching for new wind
  mCurrWindSpeed *= 0.7; //convert to m/s
  mLastWindSpeedCheck = millis();
  mWindSpeedAccumulator += mCurrWindSpeed;

  //Max gust
  if(mCurrWindSpeed > mMaxWindSpeed)
    mMaxWindSpeed = mCurrWindSpeed;

  //Wind direction
  uint wind = analogRead(WIND_DIR_PIN);
  mCurrWindDir = convertAnalogWindDirectionReadingToBearing(wind);

  //Accumulate for 5min
  mWindDirAccumulator[mWindSampleCount] = mCurrWindDir;
  mWindSampleCount++;

  if(mWindSampleCount >= WIND_ACCUM_SIZE){
    //Get the 5 min average
    mLast5MinAvgWindSpeed = (float)(mWindSpeedAccumulator/mWindSampleCount);
    mLast5MinAvgWindDir = calcAverageBearing(mWindDirAccumulator, mWindSampleCount, mLast5MinAvgWindDir);

    mWindSpeedAccumulator = 0;
    mWindSampleCount = 0;

    if(mCurrentRecord < MAX_RECORDS){
      WindRecord* nextRecord = mRecords[mCurrentRecord];
      nextRecord->time = Time.now();
      nextRecord->avgSpeed = getAvgWindSpeed();
      nextRecord->maxSpeed = getMaxWindSpeed();
      nextRecord->bearing = getWindBearing();

      mCurrentRecord++;
    }else{
      mCurrentRecord = 0;
    }
  }
}

void WindSensor::publish()
{
    char result[DATA_BUFFER_SIZE];
    for(int i=0;i<mCurrentRecord;i++){
      memset(result, 0, DATA_BUFFER_SIZE);
      sprintf(result, "{ \"time\":\"%s\", \"station\":%d, \"speed\":%.2f, \"bearing\":%d, \"max\":%.2f}",
              Time.format(mRecords[i]->time, MYSQL_DATE).c_str(),
              getStationID(),
              mRecords[i]->avgSpeed,
              mRecords[i]->bearing,
              mRecords[i]->maxSpeed);

      doPublish(WIND_PACKET, result, DATA_BUFFER_SIZE);
    }
    mCurrentRecord = 0;
}

float WindSensor::getWindSpeed()
{
  return mCurrWindSpeed;
}

float WindSensor::getAvgWindSpeed()
{
  return mLast5MinAvgWindSpeed;
}

float WindSensor::getMaxWindSpeed()
{
  return mMaxWindSpeed;
}

WIND_QUADRANT WindSensor::getAvgWindQuadrant()
{
  return convertBearingToQuadrant(mLast5MinAvgWindSpeed);
}

void WindSensor::reset()
{
  mWindSpeedAccumulator = 0;
  mWindSampleCount = 0;
  mMaxWindSpeed = 0;
  mCurrWindSpeed = 0;
  mCurrWindDir = 0;
  mLast5MinAvgWindSpeed = 0;
  mLast5MinAvgWindDir = 0;
  mWindSampleCount = 0;
  mLastWindSpeedIRQ = 0;
  mWindClicks = 0;
}


uint16_t WindSensor::getWindBearing()
{
  return mCurrWindDir;
}

WIND_QUADRANT WindSensor::getWindQuadrant()
{
  return convertBearingToQuadrant(mCurrWindDir);
}

uint16_t WindSensor::getAvgWindBearing()
{
  return mLast5MinAvgWindDir;
}

float WindSensor::calcAverageBearing(float* values, int count, float currentBearing)
{
    int avBearing = (int)currentBearing;
    if (count > 0)
    {
      long sum = values[0];
      int D = values[0];
      for(int i = 1 ; i < count ; i++)
      {
        int delta = values[i] - D;

        if(delta < -180)
          D += delta + 360;
        else if(delta > 180)
          D += delta - 360;
        else
          D += delta;

        sum += D;
      }

      avBearing = sum / count;
      if(avBearing >= 360) avBearing -= 360;
      if(avBearing < 0) avBearing += 360;
    }

    return (float)avBearing;
}

uint16_t WindSensor::convertAnalogWindDirectionReadingToBearing(int adc)
{
  // The following table is ADC readings for the wind direction sensor output, sorted from low to high.
  // Each threshold is the midpoint between adjacent headings. The output is degrees for that ADC reading.
  // Note that these are not in compass degree order! See Weather Meters datasheet for more information.

  //Wind Vains may vary in the values they return. To get exact wind direction,
  //it is recomended that you AnalogRead the Wind Vain to make sure the values
  //your wind vain output fall within the values listed below.

  uint16_t angle = 0;

  if(adc > 1400 && adc <= 1930) angle = 270;//West
  if(adc > 1930 && adc <= 2270) angle = 315;//NW
  if(adc > 2270 && adc <= 2790) angle = 0;//North
  if(adc > 2790 && adc <= 3120) angle = 225;//SW
  if(adc > 3120 && adc <= 3570) angle = 45;//NE
  if(adc > 3570 && adc <= 3700) angle = 180;//South
  if(adc > 3700 && adc <= 3950) angle = 135;//SE
  if(adc > 3950 && adc <= 4500) angle = 90;//East

  if(angle > 360 || angle < 0)
    angle = 0;

  return angle;
}

WIND_QUADRANT WindSensor::convertBearingToQuadrant(uint16_t bearing)
{
  WIND_QUADRANT quad = WIND_QUADRANT::N;

  if(bearing > 337.5 || bearing <= 22.5)
    quad = WIND_QUADRANT::N;
  else if(bearing <= 337.5 && bearing > 292.5)
    quad = WIND_QUADRANT::NW;
  else if(bearing <= 292.5 && bearing > 247.5)
    quad = WIND_QUADRANT::W;
  else if(bearing <= 247.5 && bearing > 202.5)
    quad = WIND_QUADRANT::SW;
  else if(bearing <= 202.5 && bearing > 157.5)
    quad = WIND_QUADRANT::S;
  else if(bearing <= 157.5 && bearing > 112.5)
    quad = WIND_QUADRANT::SE;
  else if(bearing <= 112.5 && bearing > 67.5)
    quad = WIND_QUADRANT::E;
  else if(bearing <= 67.5 && bearing > 22.5)
    quad = WIND_QUADRANT::NE;

  return quad;
}
