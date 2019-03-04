#pragma once
#include "application.h"
#include "WeatherPacket.h"

class UDPCommunicator
{
public:
  UDPCommunicator();
  ~UDPCommunicator();
  void begin();
  void end();

public:
  bool publish(uint8_t station, uint8_t packetType, char* data, uint8_t dataLen);

public:
  int  send(WeatherPacket& packet);
  int recvAck();

private:
  void serialise(WeatherPacket& packet, uint8_t* buffer);

private:
  uint8_t mPacketID;
  uint16_t mIndex;

  uint8_t mLastAckPacketID;
  uint8_t mLastSendPacketID;
  long mLastSendTime;
  UDP mSocket;
  IPAddress mServerIP;

  WeatherPacket packet;
};
