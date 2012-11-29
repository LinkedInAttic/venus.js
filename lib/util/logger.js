// @author LinkedIn     

// Logging system for Venus   

var winston           = require('winston'),
    DEFAULT_LOG_FILE  = __dirname + '/../../logs/venus.log',
    instance,
    levels;

// Define log levels and colors for log types
levels = {
  levels: {
    debug   : 0,
    verbose : 1,
    info    : 2,
    warn    : 3,
    error   : 4
  },
  colors: {
    debug : 'green',
    error : 'red',
    warn  : 'yellow',
    info  : 'cyan',
    verbose: 'yellow'
  }
};

// Create an instance of winston to help with logging
instance = new winston.Logger({
  transports: [
    new winston.transports.Console({ level: 'info' })
    /*new winston.transports.File({ filename: DEFAULT_LOG_FILE, handleExceptions: false, json: false })*/
  ]
}).cli();

/*Object.keys(instance.transports).forEach(function(key) {
  console.log(key);
});*/

instance.levels = levels.levels;
winston.addColors(levels.colors);

module.exports = instance;
