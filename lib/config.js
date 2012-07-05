/**
 *
 * @author LinkedIn
 */
var _          = require('underscore'),
    fs         = require('fs'),
    JSON5      = require('json5'),
    logger     = require('./util/logger'),
    fsHelper   = require('./util/fsHelper'),
    pathm      = require('path'),
    pathHelper = require('./util/pathHelper'),
    i18n       = require('./util/i18n'),
    singleton;

function Config(cwd) {
  this.configDirname  = '.venus/';
  this.configFilename = '.venus/config';

  if(cwd) {
    this.cwd = cwd;
  } else {
    this.cwd = process.cwd();
  }
}

/**
 * Search for a file in search path
 * Search base directory first, then recursively search
 * parent directories.
 * Next, look in user's home directory.
 * Finally, look in venus global directory
 */
Config.prototype.searchForFile = function(filename, path) {
  var path = path || this.cwd,
      homeLocation = '~/' + filename,
      binLocation  = this.getBinDirectory() + '/' + filename,
      results = [],
      strategies;

  strategies = [
    // Search recursively upwards
    function() {
      return fsHelper.searchUpwardsForFile(path, filename, true);
    },

    // Search home directory
    function() {
      logger.debug( i18n('Checking if %s exists (home)', homeLocation) );
      if(fs.existsSync(homeLocation)) {
        return [pathm.resolve(homeLocation)];
      }

      return false;
    },

    // Search global venus directory
    function() {
      logger.debug( i18n('Checking if %s exists (bin)', binLocation) );
      if(fs.existsSync(binLocation)) {
        return [pathm.resolve(binLocation)];
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
      results = _.uniq(results.concat(result));
    }
  }, this);

  if (results.length > 0) {
    logger.debug( i18n('Found results %s', results) );
    return results;
  } else {
    logger.error( i18n('Could not locate %s in search path', filename) );
    return false;
  }
};

/**
 * Build search path
 */
Config.prototype.getSearchPath = function() {
  if(!this.searchPath) {
    this.searchPath = this.searchForFile(this.configDirname, this.cwd);
  }

  return this.searchPath;
}

/**
 * Try to find a file in search path
 */
Config.prototype.searchPathForFile = function(filename, searchPath) {
  var searchPath = searchPath || this.getSearchPath(),
      matches = [],
      absoluteFilename;

  searchPath.forEach(function(path) {
    absoluteFilename = pathm.resolve(path + '/' + filename);

    if(fs.existsSync(absoluteFilename)) {
      matches.push(absoluteFilename);
    }
  });

  return matches;
};

/**
 * Load a file from config directory
 */
Config.prototype.loadFile = function(filename) {
  var files = this.searchPathForFile(filename),
      absPath;

  if(files.length === 0) {
    // file not found
    return false;
  }

  absPath = files[0];

  return fs.readFileSync(absPath).toString();
}

/**
 * Load a template file
 */
Config.prototype.loadTemplate = function(templateName) {
  return this.loadFile('templates/' + templateName + '.tl');
}

/**
 * Find all config files
 */
Config.prototype.findConfigs = function() {
  return this.searchPathForFile('config');
}

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

module.exports.Config = Config;
module.exports.instance = getInstance;
Object.seal(module.exports);
