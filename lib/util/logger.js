var winston           = require('winston'),
    DEFAULT_LOG_FILE  = __dirname + '/../../logs/venus.log',
    instance;

instance = new winston.Logger({
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({ filename: DEFAULT_LOG_FILE, handleExceptions: false, json: false })
  ]
});

module.exports = instance.cli();
