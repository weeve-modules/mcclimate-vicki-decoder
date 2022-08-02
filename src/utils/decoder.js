/*
Decoder documentation:
https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-vicki-lorawan/vicki-uplink-decoder#recommended-decoder-javascript-es6

*/
const { EGRESS_URLS } = require('../config/config')
const fetch = require('node-fetch')
const deviceData = {}
function decode(hexData) {
  const toBool = value => value == '1'
  const decbin = number => {
    if (number < 0) {
      number = 0xffffffff + number + 1
    }
    return parseInt(number, 10).toString(2)
  }

  const handleKeepAliveData = byteArray => {
    const tmp = ('0' + byteArray[6].toString(16)).substr(-2)
    const motorRange1 = tmp[1]
    const motorRange2 = ('0' + byteArray[5].toString(16)).substr(-2)
    const motorRange = parseInt(`0x${motorRange1}${motorRange2}`, 16)

    const motorPos2 = ('0' + byteArray[4].toString(16)).substr(-2)
    const motorPos1 = tmp[0]
    const motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16)

    const batteryTmp = ('0' + byteArray[7].toString(16)).substr(-2)[0]
    const batteryVoltageCalculated = 2 + parseInt(`0x${batteryTmp}`, 16) * 0.1

    const byteBin = decbin(byteArray[7])
    const openWindow = byteBin.substr(4, 1)
    const childLockBin = decbin(byteArray[8])
    const childLock = childLockBin.charAt(0)
    const highMotorConsumption = byteBin.substr(-2, 1)
    const lowMotorConsumption = byteBin.substr(-3, 1)
    const brokenSensor = byteBin.substr(-4, 1)

    let sensorTemp
    if (byteArray[0] == 1) {
      sensorTemp = (byteArray[2] * 165) / 256 - 40
    }
    if (byteArray[0] == 129) {
      sensorTemp = (byteArray[2] - 28.33333) / 5.66666
    }

    const keepaliveData = {
      reason: byteArray[0],
      targetTemperature: byteArray[1],
      sensorTemperature: sensorTemp,
      relativeHumidity: (byteArray[3] * 100) / 256,
      motorRange: motorRange,
      motorPosition: motorPosition,
      batteryVoltage: batteryVoltageCalculated,
      openWindow: toBool(openWindow),
      childLock: toBool(childLock),
      highMotorConsumption: toBool(highMotorConsumption),
      lowMotorConsumption: toBool(lowMotorConsumption),
      brokenSensor: toBool(brokenSensor),
    }

    Object.assign(deviceData, { ...deviceData }, { ...keepaliveData })
  }

  if (hexData) {
    const byteArray = hexData.match(/.{1,2}/g).map(byte => {
      return parseInt(byte, 16)
    })
    if (byteArray[0] == 1 || byteArray[0] == 129) {
      // its a keeapalive
      handleKeepAliveData(byteArray)
    } else {
      const resultToPass = {}
      const data = hexData.slice(0, -18)
      const commands = data.match(/.{1,2}/g)
      let command_len = 0
      // console.log(data)

      commands.map((command, i) => {
        switch (command) {
          case '04':
            {
              command_len = 2
              const data = { deviceVersions: { hardware: Number(commands[i + 1]), software: Number(commands[i + 2]) } }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '12':
            {
              command_len = 1
              const data = { keepAliveTime: parseInt(commands[i + 1], 16) }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '13':
            {
              command_len = 4
              const enabled = toBool(parseInt(commands[i + 1], 16))
              const duration = parseInt(commands[i + 2], 16) * 5
              const tmp = ('0' + commands[i + 4].toString(16)).substr(-2)
              const motorPos2 = ('0' + commands[i + 3].toString(16)).substr(-2)
              const motorPos1 = tmp[0]
              const motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16)
              const delta = Number(tmp[1])

              const data = {
                openWindowParams: { enabled: enabled, duration: duration, motorPosition: motorPosition, delta: delta },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '14':
            {
              command_len = 1
              const data = { childLock: toBool(parseInt(commands[i + 1], 16)) }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '15':
            {
              command_len = 2
              const data = {
                temperatureRangeSettings: { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '16':
            {
              command_len = 3
              const data = {
                internalAlgoParams: {
                  period: parseInt(commands[i + 1], 16),
                  pFirstLast: parseInt(commands[i + 2], 16),
                  pNext: parseInt(commands[i + 3], 16),
                },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '17':
            {
              command_len = 2
              const data = {
                internalAlgoTdiffParams: { warm: parseInt(commands[i + 1], 16), cold: parseInt(commands[i + 2], 16) },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '18':
            {
              command_len = 1
              const data = { operationalMode: commands[i + 1].toString() }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '19':
            {
              command_len = 1
              const commandResponse = parseInt(commands[i + 1], 16)
              const periodInMinutes = (commandResponse * 5) / 60
              const data = { joinRetryPeriod: periodInMinutes }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '1b':
            {
              command_len = 1
              const data = { uplinkType: commands[i + 1] }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '1d':
            {
              command_len = 2
              const deviceKeepAlive = deviceData.keepAliveTime ? deviceData.keepAliveTime : 5
              const wdpC = commands[i + 1] == '00' ? false : commands[i + 1] * deviceKeepAlive + 7
              const wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16)
              const data = { watchDogParams: { wdpC, wdpUc } }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '1f':
            {
              command_len = 1
              const data = { primaryOperationalMode: commands[i + 1] }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '21':
            {
              command_len = 6
              const data = {
                batteryRangesBoundaries: {
                  Boundary1: parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16),
                  Boundary2: parseInt(`${commands[i + 3]}${commands[i + 4]}`, 16),
                  Boundary3: parseInt(`${commands[i + 5]}${commands[i + 6]}`, 16),
                },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '23':
            {
              command_len = 4
              const data = {
                batteryRangesOverVoltage: {
                  Range1: parseInt(commands[i + 2], 16),
                  Range2: parseInt(commands[i + 3], 16),
                  Range3: parseInt(commands[i + 4], 16),
                },
              }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '27':
            {
              command_len = 1
              const data = { OVAC: parseInt(commands[i + 1], 16) }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
          case '28':
            {
              command_len = 1
              const data = { manualTargetTemperatureUpdate: parseInt(commands[i + 1], 16) }
              Object.assign(resultToPass, { ...resultToPass }, { ...data })
            }
            break
        }
        commands.splice(i, command_len)
      })

      Object.assign(deviceData, { ...deviceData }, { ...resultToPass })

      // get only keepalive from device response
      const keepaliveData = hexData.slice(-18)
      const dataToPass = keepaliveData.match(/.{1,2}/g).map(byte => {
        return parseInt(byte, 16)
      })

      handleKeepAliveData(dataToPass)
    }

    return deviceData
  }
}

const send = async result => {
  if (EGRESS_URLS) {
    const eUrls = EGRESS_URLS.replace(/ /g, '')
    const urls = eUrls.split(',')
    urls.forEach(async url => {
      if (url) {
        try {
          const callRes = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
          })
          if (!callRes.ok) {
            console.error(`Error passing response data to ${url}, status: ${callRes.status}`)
          }
        } catch (e) {
          console.error(`Error making request to: ${url}, error: ${e.message}`)
        }
      }
    })
  }
}

module.exports = {
  decode,
  send,
}
