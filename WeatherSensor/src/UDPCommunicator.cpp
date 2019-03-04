#include "UDPCommunicator.h"
#include "checksum.h"
#include "WeatherPacket.h"
#include "AckPacket.h"

#define START_PACKET 254


#define INIT 0
#define GOT_INIT 1
#define DONE 8

const long ACK_TIMEOUT = 10000;
const uint8_t MAX_RESENDS = 3;

const int LOCAL_PORT = 8765;
const int SERVER_PORT = 9765;
const char* SERVER_NAME = "weather";

UDPCommunicator::UDPCommunicator(){

}

UDPCommunicator::~UDPCommunicator(){

}

void UDPCommunicator::begin(){

  mSocket.begin(LOCAL_PORT);
  //mServerIP = WiFi.resolve(SERVER_NAME);
  IPAddress remote (192,168,100,9);
  mServerIP = remote;
}

void UDPCommunicator::end(){
  mSocket.stop();
}

bool UDPCommunicator::publish(uint8_t station, uint8_t packetType, char* data, uint8_t dataLen){
  bool result = false;
  uint8_t resends = 0;

  mLastSendTime = 0;
  mLastSendPacketID = 0;
  mLastAckPacketID = 0;

  //build packet
  packet.type = packetType;
  packet.station = station;
  memset(packet.data, 0, DATA_BUFFER_SIZE);
  memcpy(packet.data, data, dataLen);
  packet.dataLen = dataLen;

  while(!result){
    //Send packet if last one was acked or timed out
    if(mLastSendPacketID == mLastAckPacketID){
      mLastSendPacketID = send(packet);
      mLastSendTime = millis();
    }else{
      //check for ack instead
      if(recvAck() == mLastSendPacketID){
        mLastAckPacketID = mLastSendPacketID;
        result = true;
      }else{
        //Timeout waiting for ack, resend
        if((millis() - mLastSendTime) > ACK_TIMEOUT){
          mLastSendPacketID = mLastAckPacketID; //Trigger a resend
          resends++;
        }

        if(resends > MAX_RESENDS){
          break; //give up
        }
      }
    }
  }

  return result;
}

/**
 * Serialise a weather packet into a buffer ready to send
 */
void UDPCommunicator::serialise(WeatherPacket& packet, uint8_t* buffer){
  //Very simple packet format
  //- start packet
  //- packet number
  //- length of packet
  //- packet data
  //- checksum

  if(mPacketID > 253){
    mPacketID = 1;
  }else{
    mPacketID++;
  }

  packet.init = START_PACKET;
  packet.packetID = mPacketID;

  uint8_t packetSize = sizeof(WeatherPacket);
  memcpy(buffer, &packet, packetSize);

  uint16_t checkSum = crc_calculate(buffer, packetSize);
  buffer[packetSize] = (uint8_t)(checkSum & 0xFF);
  buffer[packetSize+1] = (uint8_t)(checkSum >> 8);
}

int UDPCommunicator::send(WeatherPacket& packet){
  const int buffLen = sizeof(WeatherPacket) + 2; //2 extra bytes for the CRC
  uint8_t sendBuffer[buffLen];
  int c;

  //Very simple packet format
  //- start packet
  //- packet number
  //- length of packet
  //- packet data
  //- checksum

  memset(sendBuffer, 0, buffLen);
  serialise(packet, sendBuffer);
  mSocket.sendPacket(sendBuffer, buffLen, mServerIP, SERVER_PORT);
  //mSocket.beginPacket(mServerIP, SERVER_PORT);
  //mSocket.write(sendBuffer, buffLen);
  //mSocket.endPacket();

  return packet.packetID;
}

int UDPCommunicator::recvAck(){
    int packetID = -1;
    int c = 0;
    uint8_t state;

    int recvRetries = 0;
    const uint8_t ackPacketSize = sizeof(AckPacket);
    uint8_t recvBuffer[ackPacketSize];
    int8_t buffSize = 0;
    while((buffSize = mSocket.receivePacket((byte*)recvBuffer, ackPacketSize)) <= 0){
      recvRetries++;
      if(buffSize < -1){
        mSocket.begin(LOCAL_PORT);
      }
      if(recvRetries >= MAX_RESENDS) break;
    }

    if(buffSize > 0){
      // Read data from buffer.
      //Response will be packet number and current time
      int buffPos = 0;
      state = INIT;
      while(buffPos < buffSize && state != DONE) {
          c = recvBuffer[buffPos];
          switch(state){
            case INIT:
              if(c != START_PACKET){
                state = INIT;
                return packetID;
              }else{
                  state = GOT_INIT;
              }
              break;
            case GOT_INIT:
              packetID = c;
              state = DONE;
              break;
          }
          buffPos++;
      }
    }

    return packetID;
}
