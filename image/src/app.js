const { EGRESS_URL, HOST_NAME, HOST_PORT } = require('./config/config.js')
const fetch = require('node-fetch')
const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const winston = require('winston');
const expressWinston = require('express-winston');
const { decode }=require('./utils/decoder');
const { formatPayload }=require('./utils/util');

//initialization
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//logger
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
    /*
    new winston.transports.File({
        filename: 'logs/mclimate_decoder.log'
    })
    */
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

//main post listener
app.post('/',async (req, res)=> {
  let json=req.body;
  if (!json.payload){
    res.status(400).json({status: false, message: "Payload structure is not valid."});
  }
  // parse data property, and update it
  json.payload.data=decode(Buffer.from(json.payload.data, "base64").toString('hex'));
  const output_payload=formatPayload(json);
  const callRes=await fetch(EGRESS_URL,{
    method:"POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(output_payload)
  });
  if (!callRes.ok){    
    res.status(500).json({status: false, message: `Error passing response data to ${EGRESS_URL}`});
  }
  res.status(200).json({status: true, message: "Payload processed"});
});

//handle exceptions
app.use(async (err, req, res, next) => {
  if (res.headersSent) {
      return next(err);
  }
  let errCode=err.status || 401;
  res.status(errCode).send({
    status:false,
    message:err.message
  });
});

if (require.main === module) {
  app.listen(HOST_PORT, HOST_NAME, () => {
      console.log(`McClimate Vicki Decoder listening on ${HOST_PORT}`);
  });
}
