#!/usr/bin/python

import socket


UDP_IP = "192.168.100.9"
LOCAL_UDP_PORT = 9765
REMOTE_UDP_PORT = 8765
# create socket
print("Creating socket....")
sock = socket.socket(socket.AF_INET, # Internet
					 socket.SOCK_DGRAM) # UDP
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)					 
					 
print("Opening socket....")

sock.bind((UDP_IP, REMOTE_UDP_PORT))
print("Opened socket at address {0} and port {1}".format(UDP_IP, REMOTE_UDP_PORT))

serverAddress = (UDP_IP, LOCAL_UDP_PORT)
sock.sendto("test", serverAddress)
sock.close()
