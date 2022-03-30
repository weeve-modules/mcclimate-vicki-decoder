const env = require('../utils/env')

module.exports = {
  EGRESS_URL: env('EGRESS_URL', 'https://testmp.free.beeceptor.com/'),
  HOST_NAME: env('HOST_NAME', '127.0.0.1'),
  HOST_PORT: env('HOST_PORT', '8080'),
  NESTED_RESPONSE: env('NESTED_RESPONSE', 'no'),
  CUSTOM_FIELDS: env('CUSTOM_FIELDS', ''),
  MODULE_NAME:env('MODULE_NAME','McClimate Vicki Decoder')
}
