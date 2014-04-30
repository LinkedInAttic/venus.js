/*
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 **/

/**
 * Logging system for Venus
 */
var winston          = require('winston'),
    DEFAULT_LOG_FILE = __dirname + '/../../logs/venus.log',
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
    debug   : 'green',
    error   : 'red',
    warn    : 'yellow',
    info    : 'cyan',
    verbose : 'yellow'
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
