/**
 *
 * @author LinkedIn
 */
var _          = require('underscore'),
    fs         = require('fs'),
    JSON5      = require('json5'),
    logger     = require('./util/logger'),
    fsHelper   = require('./util/fsHelper'),
    pathHelper = require('./util/pathHelper'),
    i18n       = require('./util/i18n');

function Config(cwd) {
  this.configDirName  = '.venus/';
  this.configFileName = '.venus/config';

  if(cwd) {
    this.cwd = cwd;
  } else {
    this.cwd = process.cwd();
  }
}

/**
 * Locate all available venus configs
 * Search base directory first, then recursively search
 * parent directories.
 * Next, look in user's home directory.
 * Finally, look in venus global directory
 */
Config.prototype.findConfigs = function(path) {
  var homeLocation = '~/' + this.configFileName,
      binLocation  = this.getBinDirectory(),
      configFiles  = [],
      strategies;

  strategies = [
    // Search recursively upwards
    function() {
      return fsHelper.searchUpwardsForFile(path, this.configFileName, true);
    },

    // Search home directory
    function() {
      logger.info( i18n('Looking in %s (home directory) for venus config', homeLocation) );
      if(fs.existsSync(homeLocation)) {
        return [homeLocation];
      }

      return false;
    },

    // Search global venus directory
    function() {
      logger.info( i18n('Looking in %s (venus bin) for venus config', binLocation) );
      if(fs.existsSync(binLocation)) {
        return [binLocation];
      }

      return false;
    }
  ];

  // Try each search strategy, in order, until we
  // find the configDir (the some function breaks when the return
  // value is not falsey)
  strategies.forEach(function(strat) {
    var result = strat.call(this);

    if(result) {
      configFiles = _.uniq(configFiles.concat(result));
    }
  }, this);

  if (configFiles.length > 0) {
    logger.info( i18n('Found config directory %s', configFiles) );
    return configFiles;
  } else {
    logger.error( i18n('Could not locate a venus config') );
    return false;
  }

};

/**
 * Build lookup chain of config objects.
 * When a given property is requested, we look for the property in all
 * available configs, starting with the nearest. We stop once we find
 * a config that contains the property.
 *
 * For example, say we are looking for the property "library", and there
 * is a config file in the user's home directory and in the venus bin
 * directory. We would first look at the config in the home directory,
 * and if it contains a "library" property, we'd use that. Otherwise we'd
 * move on to look at the config in the venus bin directory.
 * @param {String} path the current working directory
 */
Config.prototype.buildLookupChain = function(path) {
  var configFiles = this.configFiles = this.findConfigs(path),
      lookupChain = {
        configFiles : configFiles,
        configs     : []
      };

  if(!configFiles || configFiles.length < 1) {
    logger.error( i18n('Could not build config lookup chain - no configs found') );
    return lookUpChain;
  }

  configFiles.forEach(function(file) {
    lookupChain.configs.push(this.parseConfigFile(file));
  }, this);

  return lookupChain;
}

/**
 * Parse a config (JSON5) file
 * @param {String} path the file path
 * @return {Object} the contents of the file parsed into an object
 */
Config.prototype.parseConfigFile = function(path) {
  var fileContents,
      data;

  try {
    fileContents             = fs.readFileSync(path).toString();
    data                     = JSON5.parse(fileContents);
    data.configFilePath      = path;
    data.configFileDirectory = pathHelper(path).up().toString();
  } catch(e) {
    logger.error( i18n('Unable to parse config file %s, invalid JSON5', path) );
    throw e;
  }

  return data;
}

/**
 * Get a property from the config
 * @param {String} property name
 */
Config.prototype.get = function(property) {
  var value,
      props = property.split('.');

  if(!this.lookupChain) {
    this.lookupChain = this.buildLookupChain(this.cwd);
  }

  this.lookupChain.configs.some(function(config) {
    var lookinObject = config,
        found = false;

    props.forEach(function(prop, idx) {
      if(lookinObject.hasOwnProperty(prop)) {
        if(idx < props.length - 1) {
          lookinObject = lookinObject[prop];
        } else {
          value = lookinObject[prop];
          found = true;
        }
      }
    });

    return found;
  });

  return value;
}

/**
 * Calculate the base directory where the venus binary is running from
 */
Config.prototype.getBinDirectory = function() {
  var temp = __dirname.split('/');
  temp[temp.length - 1] = this.configFileName;
  return temp.join('/');
}

module.exports = Config;
Object.seal(module.exports);
