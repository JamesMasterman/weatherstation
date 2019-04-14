#!/usr/bin/python
import sqlite3
import json
from sqlite3 import Error
from WeatherPacket import *
from WeatherScreen import WeatherScreen

lastPacketTime = "2009-01-01 01:01"
 
def create_connection():
    database = "weather.db"
    try:
        conn = sqlite3.connect(database)
        return conn
    except Exception as e:
        print(e)
 
    return None
    
def insertRainPacket(cursor, station, weatherJSON):
    sql = "INSERT INTO rain(stat_id, when_recorded, one_hr_rain, todays_rain) VALUES(?,?,?,?)"
    values = (station, weatherJSON['time'], 
              float(weatherJSON['lasthr']), 
	      float(weatherJSON['today']))
    cursor.execute(sql, values)
    return cursor.lastrowid
    
def insertTempPacket(cursor, station, weatherJSON):
    sql = "INSERT INTO temperature(stat_id, when_recorded, humidity, temperature, pressure) VALUES(?,?,?,?,?)"
    values = (station,weatherJSON['time'], 
	      float(weatherJSON['humid']), 
	      float(weatherJSON['temp']),
	      float(weatherJSON['press']))
    cursor.execute(sql, values)
    return cursor.lastrowid
    
def insertWindPacket(cursor, station, weatherJSON):
    sql = "INSERT INTO wind(stat_id, when_recorded, bearing, speed, max_speed) VALUES(?,?,?,?,?)"
    
    values = (station, weatherJSON['time'], 
	      int(weatherJSON['bearing']), 
	      float(weatherJSON['speed']),
	      float(weatherJSON['max']))
    cursor.execute(sql, values)
    return cursor.lastrowid
    
def insertLightPacket(cursor, station, weatherJSON):
    sql = "INSERT INTO light(stat_id, when_recorded, light_percent) VALUES(?,?,?)"

    values = (station, weatherJSON['time'], 
	      float(weatherJSON['lightPercent']))
    cursor.execute(sql, values)
    return cursor.lastrowid
    
def insertSoilPacket(cursor, station, weatherJSON):
    sql = "INSERT INTO soil(stat_id, when_recorded, soil_moisture, soil_temperature) VALUES(?,?,?,?)"
   
    values = (station, weatherJSON['time'], 
	      float(weatherJSON['moist']), 
	      float(weatherJSON['temp']))
    cursor.execute(sql, values)
    return cursor.lastrowid
    
def populateLastValues(weatherScreen):
    conn = create_connection();
    try:
	
	#last temperature
	sql = "SELECT temperature, humidity, when_recorded from temperature order by when_recorded desc limit 1";
	cursor=conn.cursor()
	cursor.execute(sql)
	result_set = cursor.fetchall()
	for row in result_set:
	    weatherScreen.setTemp(float(row[0]))
	    weatherScreen.setHumidity(float(row[1]))
	    weatherScreen.setLastUpdate(row[2])
	    
	#last soil
	sql = "SELECT soil_temperature, soil_moisture, when_recorded from soil order by when_recorded desc limit 1";
	cursor=conn.cursor()
	cursor.execute(sql)
	result_set = cursor.fetchall()
	for row in result_set:
	    weatherScreen.setSoil(float(row[0]), float(row[1]))
	    
        #last wind
	sql = "SELECT max_speed, when_recorded from wind order by when_recorded desc limit 1";
	cursor=conn.cursor()
	cursor.execute(sql)
	result_set = cursor.fetchall()
	for row in result_set:
	    weatherScreen.setWind(float(row[0]))
	    
	#last rain
	sql = "SELECT todays_rain, when_recorded from rain order by when_recorded desc limit 1";
	cursor=conn.cursor()
	cursor.execute(sql)
	result_set = cursor.fetchall()
	for row in result_set:
	    weatherScreen.setRain(float(row[0]))
	    
	conn.close()
	
    except Exception as error:
	print("DB select failed with error ", error)
	return
    return
 
def saveWeatherpacketToDB(weatherPacket):
    global lastPacketTime
    
    if(weatherPacket.JSON is None):
        return
    
    conn = create_connection();
    conn.isolation_level = None
    try:
        weatherJSON = json.loads(weatherPacket.JSON)
    
        if(weatherJSON['time'] != lastPacketTime):
            cursor = conn.cursor()
            if(weatherPacket.dataType == RAIN_PACKET):
                insertRainPacket(cursor, weatherPacket.station, weatherJSON)
            elif(weatherPacket.dataType == TEMP_PACKET):
                insertTempPacket(cursor, weatherPacket.station, weatherJSON) 
            elif(weatherPacket.dataType == WIND_PACKET):
                insertWindPacket(cursor, weatherPacket.station, weatherJSON)
            elif(weatherPacket.dataType == LIGHT_PACKET):
                insertLightPacket(cursor, weatherPacket.station, weatherJSON)
            elif(weatherPacket.dataType == SOIL_PACKET):
                insertSoilPacket(cursor, weatherPacket.station, weatherJSON)
        
            lastPacketTime = weatherJSON['time']
    
        conn.close()
    
    except Exception as error:
        print("DB insert failed with error ", error)
	
    return


 
