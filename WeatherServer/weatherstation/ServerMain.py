#!/usr/bin/python

import socket
import time
import sys
from datetime import datetime
from WeatherDB import saveWeatherpacketToDB
from WeatherDB import populateLastValues
from WeatherScreen import WeatherScreen
from WeatherPacketHandler import parseWeatherPacket
from WeatherPacketHandler import createSerialisedAckPacket

UDP_IP = "192.168.100.9"
LOCAL_UDP_PORT = 9765
REMOTE_UDP_PORT = 8765
BUFFER_SIZE = 512

lcdScreen = WeatherScreen(1,"lcd")

def handleWeatherData(weatherPacket):	
	saveWeatherpacketToDB(weatherPacket)
	lcdScreen.update(weatherPacket)
	return
	
def sendAck(sock, weatherPacket, addr):
	data = createSerialisedAckPacket(weatherPacket.ID)	
	dest = (addr[0], REMOTE_UDP_PORT)
	sock.sendto(data, dest)

def main():
	#-- Main Weather server - receives weather packets from field
	try:
		
		# create socket
		print("Creating socket....")
		sock = socket.socket(socket.AF_INET, # Internet
							 socket.SOCK_DGRAM) # UDP
		sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)					 
							 
		print("Opening socket....")
		
		sock.bind((UDP_IP, LOCAL_UDP_PORT))
		print("Opened socket at address {0} and port {1}".format(UDP_IP, LOCAL_UDP_PORT))
        
        #start screen
		populateLastValues(lcdScreen)
		lcdScreen.start()
        
		#main server code - wait for packets from the field, parse them and handle
		while True:
			try:
				now = datetime.now()
				print("Waiting...", now.strftime("%Y-%m-%d %H:%M:%S"))
				sys.stdout.flush()
				data, addr = sock.recvfrom(BUFFER_SIZE)
				print("Got data")
				weatherPacket = parseWeatherPacket(data)
				print ("got message")
				if(weatherPacket.ID >= 0):
					sendAck(sock, weatherPacket, addr)    
					handleWeatherData(weatherPacket)
					
				print ("finished processing message")
			
			except Exception as error: 
				now = datetime.now()
				print("Socket error...", error, now.strftime("%Y-%m-%d %H:%M:%S"))
				sys.stdout.flush()
				sock.bind((UDP_IP, LOCAL_UDP_PORT))
			
				
	except Exception as error:
		print(error)	
		sys.stdout.flush()	
	finally:
		lcdScreen.finishScreen()
		lcdScreen.join()
		sock.close()
		print("closed")
		sys.stdout.flush()
		
if __name__ == '__main__':
    main()
    
