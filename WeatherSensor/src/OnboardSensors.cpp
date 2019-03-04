#include "OnboardSensors.h"
#include "MySQLFormats.h"
#include "WeatherPacket.h"

const float HUMIDITY_OFFSET = 0;//-20
const float TEMP_OFFSET     = -1;

const int MAX_RECORDS = 60;

OnboardSensors::OnboardSensors(int stationID): SensorBase(stationID)
{
  mRecords = new OnboardRecord*[MAX_RECORDS];
  for(int i=0;i<MAX_RECORDS;i++){
    mRecords[i] = new OnboardRecord();
  }
}

OnboardSensors::~OnboardSensors()
{
  for(int i=0;i<mCurrentRecord;i++){
    delete mRecords[i];
  }
  delete[] mRecords;
}


void OnboardSensors::setup()
{
  //Initialize the I2C sensors and ping them
  sensor.begin();

  /*You can only receive accurate barometric readings or accurate altitude
  readings at a given time, not both at the same time. The following line
  tells the sensor what mode to use. */
  sensor.setModeBarometer();//Set to Barometer Mode

  //These are additional MPL3115A2 functions that MUST be called for the sensor to work.
  sensor.setOversampleRate(7); // Set Oversample rate
  //Call with a rate from 0 to 7. See page 33 for table of ratios.
  //Sets the over sample rate. Datasheet calls for 128 but you can set it
  //from 1 to 128 samples. The higher the oversample rate the greater
  //the time between data samples.

  sensor.enableEventFlags(); //Necessary register calls to enble temp, baro and alt

}

void OnboardSensors::sample()
{
  // Measure Relative Humidity from the HTU21D or Si7021
  mHumidity = sensor.getRH() + HUMIDITY_OFFSET;
  if(mHumidity > 100) mHumidity = 100;

  // Measure Temperature from the HTU21D or Si7021
  mTemperature = (sensor.getTemp() + TEMP_OFFSET);
  // Temperature is measured every time RH is requested.
  // It is faster, therefore, to read it from previous RH
  // measurement with getTemp() instead with readTemp()

  //Measure Pressure in hPa from the MPL3115A2
  mPressure = sensor.readPressure()/100.0f;

  //Save to our buffer until next upload
  if(mCurrentRecord < MAX_RECORDS){
    OnboardRecord* nextRecord = mRecords[mCurrentRecord];
    nextRecord->time = Time.now();
    nextRecord->temperature = mTemperature;
    nextRecord->humidity = mHumidity;
    nextRecord->pressure = mPressure;
    mCurrentRecord++;
  }else{
    mCurrentRecord = 0;
  }
}

void OnboardSensors::reset()
{
  mHumidity = 0;
  mTemperature = 0;
  mPressure = 0;
}

float OnboardSensors::getCurrentTemp()
{
  return mTemperature;
}

float OnboardSensors::getCurrentHumidity()
{
  return  mHumidity;
}

float OnboardSensors::getCurrentPressure()
{
  return mPressure;
}

void OnboardSensors::publish()
{
    char result[DATA_BUFFER_SIZE];
    for(int i=0;i<mCurrentRecord;i++){
      memset(result, 0, DATA_BUFFER_SIZE);
      sprintf(result, "{ \"time\":\"%s\", \"station\":%d, \"humid\":%.2f, \"temp\":%.2f, \"press\":%.2f}",
              Time.format(mRecords[i]->time, MYSQL_DATE).c_str(),
              getStationID(),
              mRecords[i]->humidity,
              mRecords[i]->temperature,
              mRecords[i]->pressure);

      doPublish(TEMP_PACKET, result, DATA_BUFFER_SIZE);
    }

    mCurrentRecord = 0;
}
