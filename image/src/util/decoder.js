/*
Decoder documentation:
https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-vicki-lorawan/vicki-uplink-decoder#recommended-decoder-javascript-es6

*/
let deviceData = {};
function decode (hexData) {
    const toBool = value => value == '1';
    let decbin = (number) => {
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1
        }
        return parseInt(number, 10).toString(2)
    }

    const handleKeepAliveData = (byteArray) => {
        let tmp = ("0" + byteArray[6].toString(16)).substr(-2);
        let motorRange1 = tmp[1];
        let motorRange2 = ("0" + byteArray[5].toString(16)).substr(-2);
        let motorRange = parseInt(`0x${motorRange1}${motorRange2}`, 16);
    
        let motorPos2 = ("0" + byteArray[4].toString(16)).substr(-2);
        let motorPos1 = tmp[0];
        let motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16);
    
        let batteryTmp = ("0" + byteArray[7].toString(16)).substr(-2)[0];
        let batteryVoltageCalculated = 2 + parseInt(`0x${batteryTmp}`, 16) * 0.1;
    
        let byteBin = decbin(byteArray[7]);
        let openWindow = byteBin.substr(4, 1);
        let childLockBin = decbin(byteArray[8]);
        let childLock = childLockBin.charAt(0);
        let highMotorConsumption = byteBin.substr(-2, 1);
        let lowMotorConsumption = byteBin.substr(-3, 1);
        let brokenSensor = byteBin.substr(-4, 1);
    
        let sensorTemp;
        if(byteArray[0] == 1){
            sensorTemp = (byteArray[2] * 165) / 256 - 40;
        }
        if(byteArray[0] == 129){
            sensorTemp = (byteArray[2] - 28.33333) / 5.66666;
        } 
    
        let keepaliveData = {
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
            brokenSensor: toBool(brokenSensor)
        }
        
        Object.assign(deviceData, { ...deviceData }, { ...keepaliveData })
    }

    if (hexData) {
        let byteArray = hexData.match(/.{1,2}/g).map(byte => { return parseInt(byte, 16) })
        if (byteArray[0] == 1 || byteArray[0] == 129) {
            // its a keeapalive
            handleKeepAliveData(byteArray);
        } else {
            let resultToPass = {};
            let data = hexData.slice(0, -18);
            let commands = data.match(/.{1,2}/g);
            let command_len = 0;
            // console.log(data)
            
            commands.map((command, i) => {
                switch (command) {
                    case '04':
                        {
                            command_len = 2;
                            let data = { deviceVersions: { hardware: Number(commands[i + 1]), software: Number(commands[i + 2]) } };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '12':
                        {
                            command_len = 1;
                            let data = { keepAliveTime: parseInt(commands[i + 1], 16) };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '13':
                        {
                            command_len = 4;
                            let enabled = toBool(parseInt(commands[i + 1], 16));
                            let duration = parseInt(commands[i + 2], 16) * 5;
                            let tmp = ("0" + commands[i + 4].toString(16)).substr(-2);
                            let motorPos2 = ("0" + commands[i + 3].toString(16)).substr(-2);
                            let motorPos1 = tmp[0];
                            let motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16);
                            let delta = Number(tmp[1]);

                            let data = { openWindowParams: { enabled: enabled, duration: duration, motorPosition: motorPosition, delta: delta } };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });

                        }
                    break;
                    case '14':
                        {
                            command_len = 1;
                            let data = { childLock: toBool(parseInt(commands[i + 1], 16)) };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '15':
                        {   
                            command_len = 2;
                            let data = { temperatureRangeSettings: { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) } };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '16':
                        {
                            command_len = 3;
                            let data = { internalAlgoParams: {period: parseInt(commands[i + 1], 16), pFirstLast: parseInt(commands[i + 2], 16), pNext: parseInt(commands[i + 3], 16)} };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '17':
                        {
                            command_len = 2;
                            let data = { internalAlgoTdiffParams: {warm: parseInt(commands[i + 1], 16), cold: parseInt(commands[i + 2], 16)} };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '18':
                        {
                            command_len = 1;
                            let data = { operationalMode: (commands[i + 1]).toString() };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '19':
                        {
                            command_len = 1;
                            let commandResponse = parseInt(commands[i + 1], 16);
                            let periodInMinutes = (commandResponse * 5) / 60;
                            let data = { joinRetryPeriod: periodInMinutes };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '1b':
                        {
                            command_len = 1;
                            let data = { uplinkType: commands[i + 1] };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '1d':
                        {
                            command_len = 2;
                            let deviceKeepAlive = deviceData.keepAliveTime ? deviceData.keepAliveTime : 5;
                            let wdpC = commands[i + 1] == '00' ? false : (commands[i + 1] * deviceKeepAlive) + 7;
                            let wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                            let data = { watchDogParams: { wdpC, wdpUc } };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '1f':
                        {
                            command_len = 1;
                            let data = {  primaryOperationalMode: commands[i + 1] };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '21':
                        {
                            command_len = 6;
                            let data = {batteryRangesBoundaries:{ 
                                Boundary1: parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16), 
                                Boundary2: parseInt(`${commands[i + 3]}${commands[i + 4]}`, 16), 
                                Boundary3: parseInt(`${commands[i + 5]}${commands[i + 6]}`, 16), 
                            
                            }};
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '23':
                        {
                            command_len = 4;
                            let data = {batteryRangesOverVoltage:{ 
                                Range1: parseInt(commands[i + 2], 16), 
                                Range2: parseInt(commands[i + 3], 16), 
                                Range3: parseInt(commands[i + 4], 16), 
                            }};
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '27':
                        {
                            command_len = 1;
                            let data = {OVAC: parseInt(commands[i + 1], 16)};
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    case '28':
                        {
                            command_len = 1;
                            let data = { manualTargetTemperatureUpdate: parseInt(commands[i + 1], 16) };
                            Object.assign(resultToPass, { ...resultToPass }, { ...data });
                        }
                    break;
                    
                }
                commands.splice(i,command_len);
            })

            Object.assign(deviceData, { ...deviceData }, { ...resultToPass });

            // get only keepalive from device response
            let keepaliveData = hexData.slice(-18);
            let dataToPass = keepaliveData.match(/.{1,2}/g).map(byte => { return parseInt(byte, 16) });

            handleKeepAliveData(dataToPass);
        }
         
        return deviceData;
    }

}

module.exports={
    decode
}