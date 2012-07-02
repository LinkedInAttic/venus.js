/**
 * 
 * @author LinkedIn
 */
var _        = require('underscore'),
    fs       = require('fs'),
    logger   = require('./logger'),
    fsHelper = require('./util/fsHelper'),
    i18n     = require('./i18n');

function Config() {
  this.configDirName = '.venus/';
}

/**
 * Locate the closest venus config directory.
 * Search base directory first, then recursively search
 * parent directories.
 * Next, look in user's home directory.
 * Finally, look in venus global directory
 */
Config.prototype.findConfigDirectory = function(path) {
  var homeLocation = '~/' + this.configDirName,
      binLocation  = __dirname + '/../' + this.configDirName,
      configDir,
      strategies;

  strategies = [
    // Search recursively upwards
    function() {
      return fsHelper.searchUpwardsForFile(path, this.configDirName);
    },

    // Search home directory
    function() {
      logger.info( i18n('Looking in %s (home directory) for venus config', homeLocation) );
      if(fs.existsSync(homeLocation)) {
        return homeLocation;
      }

      return false;
    },

    // Search global venus directory
    function() {
      logger.info( i18n('Looking in %s (venus bin) for venus config', binLocation) );
      if(fs.existsSync(binLocation)) {
        return binLocation;
      }

      return false;
    }
  ];

  // Try each search strategy, in order, until we
  // find the configDir (the some function breaks when the return
  // value is not falsey)
  strategies.some(function(strat) {
    configDir = strat.call(this);
    return configDir;
  }, this);

  logger.info( i18n('Found config directory %s', configDir) );
  return configDir;
};

module.exports = Config;
Object.seal(module.exports);
