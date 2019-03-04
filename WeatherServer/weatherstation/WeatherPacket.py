#!/usr/bin/python

UNKNOWN_PACKET = -1
TEMP_PACKET  = 0
SOIL_PACKET  = 1
RAIN_PACKET  = 2
LIGHT_PACKET = 3
WIND_PACKET  = 4

class AckPacket:
	ID = -1
	
	def __init__(self, ID):
		self.ID = ID
		

class WeatherPacket:
	ID = -1
	station = -1
	dataType = UNKNOWN_PACKET
	JSON = ""
	
	def __init__(self):
		self.ID = -1	
		self.dataType = UNKNOWN_PACKET
		self.JSON = ""
		self.station = -1
     
