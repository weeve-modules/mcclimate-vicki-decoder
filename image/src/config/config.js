const env = require('../util/env')

module.exports = {
  EGRESS_URL: env('EGRESS_URL', 'https://testmp.free.beeceptor.com/'),
  HOST_NAME: env('HOST_NAME', '127.0.0.1'),
  HOST_PORT: env('HOST_PORT', '8080'),
}
