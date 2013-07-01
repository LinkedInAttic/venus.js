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

// Define configs for Venus application
var _             = require('underscore'),
    fs            = require('fs'),
    JSON5         = require('json5'),
    logger        = require('./util/logger'),
    fsHelper      = require('./util/fsHelper'),
    path          = require('path'),
    pathHelper    = require('./util/pathHelper'),
    i18n          = require('./util/i18n'),
    configDirname = '.venus/';


/**
 * Current working directory
 */
module.exports.cwd = process.cwd();

/**
 * Calculate the base directory where the venus binary is running from
 *
 * @return {string} base directory
 */
module.exports.getBinDirectory = function() {
  return __dirname
    .split('/')
    .slice(0, -1)
    .join('/');
};

/**
 * Search for a file in search path. Search base directory first, then
 * recursively search parent directories. Next, look in user's home directory
 * Finally, look in venus global directory
 *
 * @param {stirng} filename - File to search for
 *
 * @return {array} results - Array with paths of found files
 */
module.exports.searchForFile = function(filename) {
  var homeLocation = '~/' + filename,
      binLocation  = this.getBinDirectory() + '/' + filename,
      cwd = module.exports.cwd,
      results = [],
      strategies;

  strategies = [
    // Search recursively upwards
    function () {
      return fsHelper.searchUpwardsForFile(cwd, filename, true);
    },

    // Search home directory
    function () {
      logger.debug( i18n('Checking if %s exists (home)', homeLocation) );
      if (fs.existsSync(homeLocation)) {
        return [path.resolve(homeLocation)];
      }

      return false;
    },

    // Search global venus directory
    function () {
      logger.debug( i18n('Checking if %s exists (bin)', binLocation) );
      if (fs.existsSync(binLocation)) {
        return [path.resolve(binLocation)];
      }

      return false;
    }
  ];

  // Try each search strategy, in order, until we
  // find the configDir (the some function breaks when the return
  // value is not falsey)
  strategies.forEach(function (strat) {
    var result = strat.call(this);

    if (result) {
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
 * Try to find a file in search path
 *
 * @param {string} filename - file to look for
 *
 * @return {array} matches - Array with each element being the absolute path to
 *                a matched file
 */
module.exports.searchPathForFile = function searchPathForFile(filename) {
  var searchPath = this.searchForFile(configDirname),
      matches = [],
      absoluteFilename;

  searchPath.forEach(function (p) {
    absoluteFilename = path.resolve(p + '/' + filename);

    if (fs.existsSync(absoluteFilename)) {
      matches.push(absoluteFilename);
    }
  });

  return matches;
};

/**
 * Load a file from config directory
 *
 * @param {string} filename - File to load
 *
 * @return {string} Content of the file
 */
module.exports.loadFile = function(filename) {
  var files = this.searchPathForFile(filename),
      absPath;

  if (files.length === 0) {
    // file not found
    return false;
  }

  absPath = files[0];

  return fs.readFileSync(absPath).toString();
};

/**
 * Load a template file
 *
 * @param {string} templateName - Name of the template to load
 *
 * @return {string} Content of the template
 */
module.exports.loadTemplate = function(templateName) {
  return this.loadFile('templates/' + templateName + '.tl');
};

/**
 * Parse a config (JSON5) file
 *
 * @param {string} filePath - Path to configuration file
 *
 * @return {object} data - Object representing the configuration
 */
module.exports.parseConfigFile = function (filePath) {
  var fileContents,
      configFileDirectory,
      data,
      index,
      i,
      filelist;

  try {
    fileContents             = fs.readFileSync(filePath).toString();
    data                     = JSON5.parse(fileContents);
    configFileDirectory      = pathHelper(filePath).up().toString();
  } catch(e) {
    logger.error( i18n('Unable to parse config file %s, invalid JSON5', filePath) );
    throw e;
  }

  // Make all filePaths in the configuration file absolute
  // Libraries
  for (index in data.libraries) {
    // If there are no includes, do nothing
    if (!data.libraries[index].includes) {
      continue;
    }
    var includes = data.libraries[index].includes;

    for (i in includes) {
      includes[i] = configFileDirectory + '/' + includes[i];
    }
  }

  // BasefilePaths
  for (index in data.basePaths) {
    data.basePaths[index] = path.resolve(configFileDirectory, data.basePaths[index]);
  }

  // Binary paths
  for (index in data.binaries) {
    data.binaries[index] = path.resolve(configFileDirectory, data.binaries[index]);
  }

  // Includes
  if (typeof data.includes === 'object') {
    Object.keys(data.includes).forEach(function (index) {
      filelist = data.includes[index];
      if (typeof filelist === 'string') {
        filelist = [filelist];
      }
      data.includes[index] = filelist.map(function (file) {
        return path.resolve(configFileDirectory, file);
      });
    });
  }

  // Routes
  if (typeof data.routes === 'object') {
    Object.keys(data.routes).forEach(function (index) {
      data.routes[index] = path.resolve(configFileDirectory, data.routes[index]);
    });
  }

  // Static content
  if (typeof data.static === 'object') {
    Object.keys(data.static).forEach(function (index) {
      data.static[index] = path.resolve(configFileDirectory, data.static[index]);
    });
  }

  // All properties containing 'path' in key name
  data = this.makePathsAbsolute(data, configFileDirectory);

  return data;
};

/**
 * Make all paths absolute
 * @param {object} data config object
 * @param {string} configFileDirectory base path
 */
module.exports.makePathsAbsolute = function (data, configFileDirectory) {

  if (Array.isArray(data)) {
    return data.map(function (item) {
      return this.makePathsAbsolute(item);
    }, this);
  } else if (typeof data === 'object') {
    Object.keys(data).forEach(function (key) {
      var value, isPathKey;

      value = data[key];
      isPathKey = (key.toUpperCase().indexOf('PATH') !== -1);

      if (isPathKey && Array.isArray(value)) {
        data[key] = value.map(function (item) {
          return path.resolve(configFileDirectory, item);
        });
      } else if (isPathKey && typeof value === 'string') {
        data[key] = path.resolve(configFileDirectory, value);
      } else if (typeof value === 'object') {
        data[key] = this.makePathsAbsolute(value, configFileDirectory);
      } else {
        data[key] = value;
      }
    }, this);
  }

  return data;
};

/**
 * Merge objects
 * @param {object} merged merged object
 * @param {object} mergee object to merge
 */
module.exports.merge = function (merged, mergee) {
  Object.keys(mergee).forEach(function (key) {
    var value = mergee[key],
        mergedValue = merged[key];

    if (!Array.isArray(mergedValue) && typeof mergedValue === 'object' && typeof value === 'object') {
      this.merge(mergedValue, value);
    } else {
      merged[key] = value;
    }
  }, this);
};

/**
 * Returns an object representing the configuration for the current venus run
 * @return {object}
 */
module.exports.getConfig = function() {
  var configFiles = this.searchPathForFile('config'),
      mergedConfig = {},
      i;


  if (!configFiles || configFiles.length < 1) {
    logger.error(i18n('Could not build config lookup chain - no configs found'));
    return;
  }

  // configFiles has higher priority files in the begining so we want to merge
  // those files last
  i = configFiles.length;
  for (i = configFiles.length - 1; i >=0; i--) {
    this.merge(mergedConfig, this.parseConfigFile(configFiles[i]));
  }

  mergedConfig.get = function () {
    var args = Array.prototype.slice.call(arguments, 0).join('.').split('.'),
        property = this;

    args.some(function (arg) {
      property = property[arg];
      if (typeof property === 'undefined') {
        property = null;
        return true;
      }
    }, this);

    return property;
  };

  return mergedConfig;
};

Object.seal(module.exports);
