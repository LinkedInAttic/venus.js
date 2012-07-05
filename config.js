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
    i18n       = require('./util/i18n'),
    singleton;

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
 * Search for a given file in the search path
 */
Config.prototype.searchForFile = function(cwd, filename) {
  var start = cwd || this.cwd,
      homeLocation = '~/' + filename,
      binLocation = this.getBinDirectory() + '/' + filename;

  strategies = [
    // Search recursively upwards
    function() {
      return fsHelper.searchUpwardsForFile(path, this.configDirName, true);
    },

    // Search home directory
    function() {
      logger.info( i18n('Looking in %s (home directory) for %s', homeLocation, filename) );
      if(fs.existsSync(homeLocation)) {
        return [homeLocation];
      }

      return false;
    },

    // Search global venus directory
    function() {
      logger.info( i18n('Looking in %s (venus bin) for %s', binLocation, filename) );
      if(fs.existsSync(binLocation)) {
        return [binLocation];
      }

      return false;
    }
  ];

  // Try each search strategy, in order, until we
  // find the desired file
  strategies.forEach(function(strat) {
    var result = strat.call(this);

    if(result) {
      results = _.uniq(results.concat(result));
    }
  }, this);

  if (results.length > 0) {
    logger.info( i18n('Found paths %s', results) );
    return results;
  } else {
    logger.error( i18n('Could not locate %s in search path', results) );
    return false;
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
  var path = path || this.cwd,
      configDirs = this.searchForFile(path, this.configDirName);

  

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
 * Load a file, with a path specified relative to a config directory.
 * Search order is the same as for property lookup: local .venus --> root,
 * then ~/.venus, then bin directory .venus
 */
Config.prototype.loadFile = function(relativePath) {

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
 * Get search path
 */
Config.prototype.getSearchPath = function() {
  if(!this.searchPath) {
    this.searchPath = this.searchForFile(this.cwd, this.configDirName);
  }

  return this.searchPath;
}

/**
 * Calculate the base directory where the venus binary is running from
 */
Config.prototype.getBinDirectory = function() {
  return __dirname
    .split('/')
    .slice(0, -1)
    .join('/');
}

/**
 * Return singleton instance config
 */
function getInstance() {
  if(!singleton) {
    singleton = new Config(process.cwd());
  }

  return singleton;
}

module.exports.Config;
module.exports.instance = getInstance;
Object.seal(module.exports);
