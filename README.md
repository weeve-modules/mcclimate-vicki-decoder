# McClimate Vicki Decoder

|                |                                 |
| -------------- | ------------------------------- |
| Name           | McClimate Vicki Decoder               |
| Version        | v1.0.0                          |
| Dockerhub Link | [weevenetwork/mcclimate-vicki-decoder]() |
| Authors        | Mesud Pasic                     |



- [MQTT Ingress](#mcclimate-decoder)
  - [Description](#description)
  - [Features](#features)
  - [Environment Variables](#environment-variables)
    - [Module Specific](#module-specific)
    - [Set by the weeve Agent on the edge-node](#set-by-the-weeve-agent-on-the-edge-node)
  - [Dependencies](#dependencies)




## Description

Decode Vicki LoRaWAN's payload into human-friendly format. 
You'll be able to retrieve:
- Target Temperature
- Measured temperature and humidity
- motorPosition and motorRange
- openWindow detection
- ChildLock
- High and Low Motor Consumption warning bytes
- Temp and humidity sensor status byte - is it functional or broken
- Battery voltage

Incoming payload looks like this:
{
  "payload": {
    "adr": true,
    "applicationID": "165",
    "applicationName": "101976551-101976576-",
    "confirmedUplink": false,
    "data": "AQBSAj8D/gM9Bw4FCwAAAAcNAA8AEgA=",
    "devAddr": "AHCcrA==",
    "devEUI": "70b3d52dd3003e30",
    "deviceName": "70B3D52DD3003E30",
    "dr": 5,
    "objectJSON": "",
    "rxInfo": [
      {
        "antenna": 0,
        "board": 263,
        "channel": 7,
        "context": "k3pa1A==",
        "crcStatus": "CRC_OK",
        "fineTimestampType": "NONE",
        "gatewayID": "cHb/AGQDBbc=",
        "loRaSNR": 7,
        "location": {
          "accuracy": 0,
          "altitude": 0,
          "latitude": 0,
          "longitude": 0,
          "source": "UNKNOWN"
        },
        "rfChain": 0,
        "rssi": -69,
        "time": "2022-03-22T11:31:29.527",
        "timeSinceGPSEpoch": null,
        "uplinkID": "b0Gb7KexQnKNp42bxnYD1w=="
      }
    ],
    "tags": null,
    "txInfo": {
      "frequency": 868500000,
      "loRaModulationInfo": {
        "bandwidth": 125,
        "codeRate": "4/5",
        "polarizationInversion": false,
        "spreadingFactor": 7
      },
      "modulation": "LORA"
    },
    "fcnt": 6150,
    "fport": 5
  },
  "type": "up"
}

Decoded output passed to next module via POST call will look like this:
{
   "payload":{
      "adr":true,
      "applicationID":"165",
      "applicationName":"101976551-101976576-",
      "confirmedUplink":false,
      "data":{
         "reason":1,
         "targetTemperature":0,
         "sensorTemperature":12.8515625,
         "relativeHumidity":0.78125,
         "motorRange":3587,
         "motorPosition":3903,
         "batteryVoltage":2,
         "openWindow":false,
         "childLock":true,
         "highMotorConsumption":true,
         "lowMotorConsumption":true,
         "brokenSensor":true
      },
      "devAddr":"AHCcrA==",
      "devEUI":"70b3d52dd3003e30",
      "deviceName":"70B3D52DD3003E30",
      "dr":5,
      "objectJSON":"",
      "rxInfo":[
         {
            "antenna":0,
            "board":263,
            "channel":7,
            "context":"k3pa1A==",
            "crcStatus":"CRC_OK",
            "fineTimestampType":"NONE",
            "gatewayID":"cHb/AGQDBbc=",
            "loRaSNR":7,
            "location":{
               "accuracy":0,
               "altitude":0,
               "latitude":0,
               "longitude":0,
               "source":"UNKNOWN"
            },
            "rfChain":0,
            "rssi":-69,
            "time":"2022-03-22T11:31:29.527",
            "timeSinceGPSEpoch":null,
            "uplinkID":"b0Gb7KexQnKNp42bxnYD1w=="
         }
      ],
      "tags":null,
      "txInfo":{
         "frequency":868500000,
         "loRaModulationInfo":{
            "bandwidth":125,
            "codeRate":"4/5",
            "polarizationInversion":false,
            "spreadingFactor":7
         },
         "modulation":"LORA"
      },
      "fcnt":6150,
      "fport":5
   },
   "type":"up"
}

## Features

* Parsing Melita.io data for thermostat
* Sends data to next module service via REST API

## Environment Variables

* EGRESS_URL
* HOST_NAME
* HOST_PORT

### Module Specific

### Set by the weeve Agent on the edge-node

| Environment Variables | type   | Description                            |
| --------------------- | ------ | -------------------------------------- |
| EGRESS_URL       | string | HTTP ReST endpoint for the next module |
| MODULE_NAME           | string | Name of the module                     |
| HOST_NAME           | string | Host where app is running              |
| HOST_PORT           | string | Port where app is running              |



## Dependencies

```js
"dependencies": {
    "body-parser": "^1.19.2",
    "express": "^4.17.3",
    "express-winston": "^4.2.0",
    "node-fetch": "^2.6.1",
    "winston": "^3.6.0"
}
```