#pragma once
const uint8_t TEMP_PACKET =0;
const uint8_t SOIL_PACKET =1;
const uint8_t RAIN_PACKET =2;
const uint8_t LIGHT_PACKET=3;
const uint8_t WIND_PACKET =4;

const uint8_t DATA_BUFFER_SIZE = 200;

//Very simple packet format
//- start packet
//- packet number
//- length of packet
//- packet data
//- checksum

typedef struct WeatherPacket_t{
  /**
   * intialiser for packet start
   */
  uint8_t init;

  /**
   * id of packet
   */
  uint8_t packetID;

  /**
   * type of packet
   */
  uint8_t type;

  /**
   * ID of station who sent this packet
   */
  uint8_t station;

 /**
  * length of data in the data string
  */
  uint8_t dataLen;

  /**
   * data within packet (formatted json string)
   */
  char data[DATA_BUFFER_SIZE];
}  WeatherPacket;
