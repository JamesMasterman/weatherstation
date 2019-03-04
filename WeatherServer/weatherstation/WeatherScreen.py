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
        self.mLastReadingDay = -1
        self.mHumidity = 0
        self.mCurrentDisplayItem = TEMPERATURE
        
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
    
        
    def update(self, weatherPacket):
        
        try:
            threadlock.acquire()
            
            timeNow = datetime.now()
            self.mLastReadingStr = timeNow.strftime("%H:%M %d-%m-%y")
            weatherJSON = json.loads(weatherPacket.JSON)
            
            if(weatherPacket.dataType == TEMP_PACKET):
                self.handleTempPacket(weatherJSON)
            elif(weatherPacket.dataType == RAIN_PACKET):
                self.handleRainPacket(weatherJSON)
            elif(weatherPacket.dataType == SOIL_PACKET):
                self.handleSoilPacket(weatherJSON)
            elif(weatherPacket.dataType == WIND_PACKET):
                self.handleWindPacket(weatherJSON)
            threadlock.release()
            
        except Error as error:
            print(error)
            threadlock.release()
        
        return
        

    def handleTempPacket(self, weatherJSON):
        
        lastReadingStr = str(weatherJSON['time'])
        packetTime = datetime.strptime(lastReadingStr, '%Y-%m-%d %H:%M:%S')

        if(self.mLastReadingDay != packetTime.day):
            self.mLastReadingDay = packetTime.day
            self.resetTotals()
                
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
        exitFlag = 1
        return
              
    def resetTotals(self):
        self.mMaxAir = -99.0
        self.mMinAir = 99.0
        return
    
    def getWindDirection(self, windBearing):
        if(windBearing > 337.5 and windBearing <= 22.5):
            return "N"
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
            return "NW"
            
    def run(self):
        while True:
            if exitFlag:
                threadName.exit()
            self.cycleDisplay()
            time.sleep(5)
            
            
        return

