#include "SoilSensors.h"
#include "MySQLFormats.h"
#include "PinIDs.h"
#include "WeatherPacket.h"
#include <math.h>

// resistance at 25 degrees C
#define THERMISTORNOMINAL 10000
// temp. for nominal resistance (almost always 25 C)
#define TEMPERATURENOMINAL 25
// how many samples to take and average, more takes longer
// but is more 'smooth'
#define NUM_SAMPLES 5
// The beta coefficient of the thermistor (usually 3000-4000)
#define BCOEFFICIENT 3950
// the value of the 'other' resistor
#define SERIESRESISTOR 10000

#define TEMPERATURE_PRECISION 11

const int MAX_RECORDS = 5;

//Run I2C Scanner to get address of DS18B20(s)
//(found in the Firmware folder in the Photon Weather Shield Repo)
/***********REPLACE THIS ADDRESS WITH YOUR ADDRESS*************/
DeviceAddress inSoilThermometer = {0x28, 0xAA, 0x7E, 0x3E, 0x54, 0x14, 0x01, 0x73};//Waterproof temp sensor address

SoilSensors::SoilSensors(int stationID, DallasTemperature* soilTempSensor): SensorBase(stationID)
{
    mSoilMoistureReading = 0;
    mSoilMoisturePercent = 0;
    mSoilTemperature = 0;

    mRecords = new SoilRecord*[MAX_RECORDS];
    for(int i=0;i<MAX_RECORDS;i++){
      mRecords[i] = new SoilRecord();
    }

    mSoilTempSensor = soilTempSensor;

}

SoilSensors::~SoilSensors()
{
  for(int i=0;i<mCurrentRecord;i++){
    delete mRecords[i];
  }
  delete[] mRecords;
}

void SoilSensors::setup()
{
  pinMode(SOIL_MOISTURE_POWER, OUTPUT);//power control for soil moisture
  digitalWrite(SOIL_MOISTURE_POWER, LOW);//Leave off by defualt

  // DS18B20 initialization
  mSoilTempSensor->begin();
  mSoilTempSensor->setResolution(inSoilThermometer, TEMPERATURE_PRECISION);
}

void SoilSensors::sample()
{
   sampleMoisture();
   sampleTemperature();

   if(mCurrentRecord < MAX_RECORDS){
     SoilRecord* nextRecord = mRecords[mCurrentRecord];
     nextRecord->time = Time.now();
     nextRecord->temperature = getSoilTemperature();
     nextRecord->moisturePerc = getSoilMoisturePercent();
     mCurrentRecord++;
   }else{
     mCurrentRecord = 0;
   }

 }

void SoilSensors::sampleMoisture()
{
  //Leaving the soil moisture sensor powered
  //all the time lead to corrosion of the probes. Thus, this port breaks out
  //Digital Pin D5 as the power pin for the sensor, allowing the Photon to
  //power the sensor, take a reading, and then disable power on the sensor,
  //giving the sensor a longer lifespan.
  digitalWrite(SOIL_MOISTURE_POWER, HIGH);
  delay(200);

  mSoilMoistureReading = 0;
  for(int i=0;i<NUM_SAMPLES;i++){
    mSoilMoistureReading += analogRead(SOIL_MOISTURE_READING);
    delay(10);
  }

  mSoilMoistureReading/= NUM_SAMPLES;

  //Turn it off
  delay(100);
  digitalWrite(SOIL_MOISTURE_POWER, LOW);
  mSoilMoisturePercent = convertSampleToPercent(mSoilMoistureReading);
}

void SoilSensors::sampleTemperature()
{
  mSoilTempSensor->requestTemperatures();
  float soilTemp = mSoilTempSensor->getTempC(inSoilThermometer);

  //Every so often there is an error that throws a -127.00, this compensates
  if(soilTemp > -100){
      mSoilTemperature = soilTemp;//push last value so data isn't out of scope
  }
}

void SoilSensors::publish()
{
  char result[DATA_BUFFER_SIZE];
  for(int i=0;i<mCurrentRecord;i++){
    memset(result, 0, DATA_BUFFER_SIZE);
    sprintf(result, "{ \"time\":\"%s\", \"station\":%d, \"moist\":%d, \"temp\":%.2f}",
            Time.format(mRecords[i]->time, MYSQL_DATE).c_str(),
            getStationID(),
            mRecords[i]->moisturePerc,
            mRecords[i]->temperature);

    //Publish to the particle cloud
    doPublish(SOIL_PACKET, result, DATA_BUFFER_SIZE);
  }

  mCurrentRecord = 0;
}

int SoilSensors::getSoilReading()
{
  return mSoilMoistureReading;
}

int SoilSensors::getSoilMoisturePercent()
{
  return mSoilMoisturePercent;
}

float SoilSensors::getSoilTemperature()
{
  return mSoilTemperature;
}

int SoilSensors::convertSampleToPercent(int sample)
{
  int perc = 0;
  perc = (sample-2800)*100/550;

  if(perc > 100)
    perc = 100;

  if(perc < 0)
    perc = 0;
  return perc;
}
