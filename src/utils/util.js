const { NESTED_RESPONSE, CUSTOM_FIELDS } = require('../config/config')
const formatPayload = json => {
  let t = null
  if (!json.rxInfo[0].time) {
    t = Date.now()
  } else {
    if (json.rxInfo[0].time.toString() == parseInt(json.rxInfo[0].time).toString())
      t = new Date(parseInt(json.rxInfo[0].time)).getTime()
    else t = new Date(json.rxInfo[0].time).getTime()
  }
  const output = {
    // convert ISO date time to timestamp
    timestamp: t,
    devEUI: json.devEUI,
    deviceName: json.deviceName,
  }
  let fields = []
  if (CUSTOM_FIELDS !== '' && CUSTOM_FIELDS.indexOf(',') !== -1) fields = CUSTOM_FIELDS.trim().split(',')
  else if (CUSTOM_FIELDS !== '') fields.push(CUSTOM_FIELDS)
  // not nested, no custom fields
  if (fields.length == 0 && NESTED_RESPONSE == 'no') {
    Object.keys(json.data).forEach(key => {
      if (json.data[key] === false) output[key] = 'false'
      else if (json.data[key] === true) output[key] = 'true'
      else output[key] = json.data[key]
    })
  }
  // nested, no custom fields
  if (fields.length == 0 && NESTED_RESPONSE == 'yes') {
    output.data = json.data
  }
  // not nested, with custom fields
  if (fields.length != 0 && NESTED_RESPONSE == 'no') {
    const keys = Object.keys(json.data)
    fields.forEach(field => {
      if (keys.indexOf(field) !== -1) {
        if (json.data[field] === false) output[field] = 'false'
        else if (json.data[field] === true) output[field] = 'true'
        else output[field] = json.data[field]
      }
    })
  }
  // nested, with custom fields
  if (fields.length != 0 && NESTED_RESPONSE == 'yes') {
    const keys = Object.keys(json.data)
    output.data = {}
    fields.forEach(field => {
      if (keys.indexOf(field) !== -1) {
        if (json.data[field] === false) output.data[field] = 'false'
        else if (json.data[field] === true) output.data[field] = 'true'
        else output.data[field] = json.data[field]
      }
    })
  }
  return output
}
module.exports = {
  formatPayload,
}
