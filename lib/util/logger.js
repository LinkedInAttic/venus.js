var winston           = require('winston'),
    DEFAULT_LOG_FILE  = __dirname + '/../../logs/venus.log';

module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: DEFAULT_LOG_FILE, handleExceptions: true, json: false })
  ]
}).cli();
