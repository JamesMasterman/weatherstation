#!/usr/bin/python
from WeatherPacket import WeatherPacket
from WeatherPacket import AckPacket
import array

PARSE_STATE_INIT = 0
PARSE_STATE_GOT_INIT = 1
PARSE_STATE_GOT_ID = 2
PARSE_STATE_GOT_TYPE = 3
PARSE_STATE_GOT_STATION = 4
PARSE_STATE_GOT_LENGTH = 5
PARSE_STATE_GOT_STRING = 6
PARSE_STATE_GOT_CRC = 7
PARSE_STATE_DONE = 8

START_PACKET = 254

def parseWeatherPacket(rawPacket):
	packet = WeatherPacket()
	state = PARSE_STATE_INIT
	ubyteData = array.array("B",rawPacket)
	ubyteLen = len(ubyteData)

	pos = 0
	dataLength = 0
	dataPos = 0
	data = bytearray(200)
	
	while state != PARSE_STATE_DONE:
		if(state == PARSE_STATE_INIT):
			if(ubyteData[pos] != START_PACKET):
				return packet
				
			state = PARSE_STATE_GOT_INIT
			pos +=1
		elif(state == PARSE_STATE_GOT_INIT):
			packet.ID = ubyteData[pos]
			pos +=1
			state = PARSE_STATE_GOT_ID
		elif(state == PARSE_STATE_GOT_ID):
			packet.dataType = ubyteData[pos]
			pos +=1
			state = PARSE_STATE_GOT_TYPE
		elif(state == PARSE_STATE_GOT_TYPE):
			packet.station = ubyteData[pos]
			pos +=1
			state = PARSE_STATE_GOT_STATION
		elif(state == PARSE_STATE_GOT_STATION):
			dataLength = ubyteData[pos]
			pos +=1
			state = PARSE_STATE_GOT_LENGTH
			data = bytearray(dataLength)
		elif(state == PARSE_STATE_GOT_LENGTH):
			data[dataPos] = ubyteData[pos];
			dataPos+=1
			pos+=1
			if(dataPos >= dataLength):
				state = PARSE_STATE_DONE
				data.strip()
				packet.JSON = data.decode("ascii")   
			
	return packet

def createAckPacket(ID):
	ack = AckPacket(ID)
	return ack
	
def serialiseAckPacket(ackPacket):
	data = bytearray(2);
	data[0] = START_PACKET
	data[1] = ackPacket.ID
	return data
	
def createSerialisedAckPacket(ID):
	ack = createAckPacket(ID)
	data = serialiseAckPacket(ack)
	return data
		

