#!/usr/bin/python
import Adafruit_CharLCD as LCDPanel
import json
from datetime import datetime
from WeatherPacket import *
import threading
import time

TEMPERATURE  = 0
HUMIDITY     = 1
TODAYS_RAIN  = 2
SOIL_MOIST   = 3
SOIL_TEMP    = 4
WIND_SPEED   = 5
LAST_READING = 6

CYCLE_MAX    = 6

exitFlag = 0
threadlock = threading.Lock()

class WeatherScreen (threading.Thread):

    def __init__(self, threadID, name):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        
        self.mMaxAir = -99.0
        self.mMinAir = 99.0
        self.mWind = 0.0
        self.mWindDir = "N"
        self.mDailyRain = 0.0
        self.mSoilMoisture = 0.0
        self.mSoilTemperature = 0.0
        self.mLastReadingStr = "01:01 01-01-19"
        self.mLcd = LCDPanel.Adafruit_CharLCDBackpack()
        self.mHumidity = 0
        self.mCurrentDisplayItem = TEMPERATURE
        self.mRunning = True
        self.mLastPacketTime = datetime(2000,1,1)
        self.mLastPacketType = UNKNOWN_PACKET
    
        
        # Turn backlight on
        self.mLcd.set_backlight(0)
        self.mLcd.clear()
    
    def cycleDisplay(self):
        threadlock.acquire()
        
        self.mLcd.clear()
        if(self.mCurrentDisplayItem == TEMPERATURE):
            self.mLcd.message("Air temp (C)\nMin:{0:.0f} Max:{1:.0f}".format(self.mMinAir, self.mMaxAir))
        elif(self.mCurrentDisplayItem == HUMIDITY):
            self.mLcd.message("Humidity (%)\n{0:.0f}".format(self.mHumidity))
        elif(self.mCurrentDisplayItem == TODAYS_RAIN):
            self.mLcd.message("Rainfall (mm)\n{0:.1f}".format(self.mDailyRain))
        elif(self.mCurrentDisplayItem == SOIL_MOIST):
            self.mLcd.message("Soil moist (%)\n{0:.1f}".format(self.mSoilMoisture))
        elif(self.mCurrentDisplayItem == SOIL_TEMP):
            self.mLcd.message("Soil temp (C)\n{0:.1f}".format(self.mSoilTemperature))
        elif(self.mCurrentDisplayItem == WIND_SPEED):
            self.mLcd.message("Max wind (km/hr)\n{0:.1f} {1}".format(self.mWind,self.mWindDir))
        elif(self.mCurrentDisplayItem == LAST_READING):
            self.mLcd.message("Last reading\n{0}".format(self.mLastReadingStr))
                
        self.mCurrentDisplayItem += 1
        if(self.mCurrentDisplayItem > CYCLE_MAX):
            self.mCurrentDisplayItem = 0
            
        threadlock.release()
            
        return
    
    def setTemp(self, temp):
        self.mMinAir = temp
        self.mMaxAir = temp
        return
        
    def setHumidity(self, humid):
        self.mHumidity = humid
        return
        
    def setLastUpdate(self, lastUpdate):
        self.mLastReadingStr = lastUpdate
        return
        
    def setSoil(self, temp, moisture):
        self.mSoilMoisture = moisture
        self.mSoilTemperature = temp
        return
        
    def setWind(self, wind_max):
        self.mWind = wind_max*3.6
        return
        
    def setRain(self, todays_rain):
        self.mDailyRain = todays_rain
        return
        
    def update(self, weatherPacket):
        
        try:
            threadlock.acquire()
            
            timeNow = datetime.now()
            weatherJSON = json.loads(weatherPacket.JSON)
            packetTimeStr = str(weatherJSON['time'])
            packetTime = datetime.strptime(packetTimeStr, '%Y-%m-%d %H:%M:%S')
            
            if(packetTime > self.mLastPacketTime or weatherPacket.dataType != self.mLastPacketType):
                self.mLastPacketTime = packetTime
                self.mLastPacketType = weatherPacket.dataType
                if(packetTime.day != timeNow.day):
                    self.resetTotals()
                    
                self.mLastReadingStr = timeNow.strftime("%H:%M %d-%m-%y")
                if(weatherPacket.dataType == TEMP_PACKET):
                    self.handleTempPacket(weatherJSON)
                elif(weatherPacket.dataType == RAIN_PACKET):
                    self.handleRainPacket(weatherJSON)
                elif(weatherPacket.dataType == SOIL_PACKET):
                    self.handleSoilPacket(weatherJSON)
                elif(weatherPacket.dataType == WIND_PACKET):
                    self.handleWindPacket(weatherJSON)
                    
            threadlock.release()
            
        except Exception as error:
            print(error)
            threadlock.release()
        
        return
        

    def handleTempPacket(self, weatherJSON):
        temp = float(weatherJSON['temp'])
        if(self.mMaxAir < temp):
            self.mMaxAir = temp
        if(self.mMinAir > temp):
            self.mMinAir = temp
        self.mHumidity = float(weatherJSON['humid'])
            
        return
            
    def handleRainPacket(self, weatherJSON):
        self.mDailyRain = float(weatherJSON['today'])  
        return
        
    def handleSoilPacket(self, weatherJSON):
        self.mSoilMoisture = float(weatherJSON['moist'])
        self.mSoilTemperature = float(weatherJSON['temp'])
        return
        
    def handleWindPacket(self, weatherJSON):
        self.mWind = float(weatherJSON['max']) * 3.6
        self.mWindDir = self.getWindDirection(float(weatherJSON['bearing']))
        return
                    
    def finishScreen(self):
        self.mRunning = False
        return
              
    def resetTotals(self):
        self.mMaxAir = -99.0
        self.mMinAir = 99.0
        return
    
    def getWindDirection(self, windBearing):
        if(windBearing > 292.5 and windBearing <=337.5):
            return "NW"
        elif(windBearing >22.5 and windBearing <=67.5):
            return "NE"
        elif(windBearing >67.5 and windBearing <=112.5):
            return "E"
        elif(windBearing >112.5 and windBearing <=157.5):
            return "SE"
        elif(windBearing >157.5 and windBearing <=202.5):
            return "S"
        elif(windBearing >202.5 and windBearing <=247.5):
            return "SW"
        elif(windBearing >247.5 and windBearing <=292.5):
            return "W"
        else:
            return "N"
            
    def run(self):
        while self.mRunning:
            self.cycleDisplay()
            time.sleep(5)
            
            
        return

