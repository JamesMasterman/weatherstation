#!/bin/bash
echo "starting weather server"
cd /home/pi/Documents/programming/weatherstation/
sleep 120
sudo python ServerMain.py >> serverlog.txt
