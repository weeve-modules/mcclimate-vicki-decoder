const { NESTED_RESPONSE, CUSTOM_FIELDS } = require('../config/config')
const formatPayload = json => {
  let output = {
    //convert ISO date time to timestamp
    timestamp: new Date(parseInt(json.data.rxInfo[0]['time'])).getTime(),
    devEUI: json.data['devEUI'],
    deviceName: json.data['deviceName'],
  }
  let fields = []
  if (CUSTOM_FIELDS !== '' && CUSTOM_FIELDS.indexOf(',') !== -1) fields = CUSTOM_FIELDS.trim().split(',')
  else if (CUSTOM_FIELDS !== '') fields.push(CUSTOM_FIELDS)
  //not nested, no custom fields
  if (fields.length == 0 && NESTED_RESPONSE == 'no') {
    Object.keys(json.data.data).forEach(key => {
      output[key] = json.data.data[key]
    })
  }
  //nested, no custom fields
  if (fields.length == 0 && NESTED_RESPONSE == 'yes') {
    output['data'] = json.data.data
  }
  //not nested, with custom fields
  if (fields.length != 0 && NESTED_RESPONSE == 'no') {
    let keys = Object.keys(json.data.data)
    fields.forEach(field => {
      if (keys.indexOf(field) !== -1) {
        output[field] = json.data.data[field]
      }
    })
  }
  //nested, with custom fields
  if (fields.length != 0 && NESTED_RESPONSE == 'yes') {
    let keys = Object.keys(json.data.data)
    output['data'] = {}
    fields.forEach(field => {
      if (keys.indexOf(field) !== -1) {
        output['data'][field] = json.data.data[field]
      }
    })
  }
  return output
}
const formatTimeDiff = (t1, t2) => {
  const diff = Math.max(t1, t2) - Math.min(t1, t2)
  const SEC = 1000,
    MIN = 60 * SEC,
    HRS = 60 * MIN
  const hrs = Math.floor(diff / HRS)
  const min = Math.floor((diff % HRS) / MIN).toLocaleString('en-US', { minimumIntegerDigits: 2 })
  const sec = Math.floor((diff % MIN) / SEC).toLocaleString('en-US', { minimumIntegerDigits: 2 })
  const ms = Math.floor(diff % SEC).toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false })
  return `${hrs}:${min}:${sec}`
}
module.exports = {
  formatPayload,
  formatTimeDiff,
}
