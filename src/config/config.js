const env = require('../utils/env')

module.exports = {
  EGRESS_URLS: env('EGRESS_URLS', ''),
  INGRESS_HOST: env('INGRESS_HOST', '127.0.0.1'),
  INGRESS_PORT: env('INGRESS_PORT', '8080'),
  NESTED_RESPONSE: env('NESTED_RESPONSE', 'no'),
  CUSTOM_FIELDS: env('CUSTOM_FIELDS', ''),
  MODULE_NAME: env('MODULE_NAME', 'McClimate Vicki Decoder'),
}
