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

var _          = require('underscore'),
    fs         = require('fs'),
    JSON5      = require('json5'),
    logger     = require('./util/logger'),
    fsHelper   = require('./util/fsHelper'),
    path       = require('path'),
    pathHelper = require('./util/pathHelper'),
    i18n       = require('./util/i18n'),
    cwd        = process.cwd(),
    configDirname = '.venus/';

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
 * @param {string} path - Path to configuration file
 *
 * @return {object} data - Object representing the configuration
 */
module.exports.parseConfigFile = function(path) {
  var fileContents,
      configFileDirectory,
      data,
      index,
      i;

  try {
    fileContents             = fs.readFileSync(path).toString();
    data                     = JSON5.parse(fileContents);
    configFileDirectory = pathHelper(path).up().toString();
  } catch(e) {
    logger.error( i18n('Unable to parse config file %s, invalid JSON5', path) );
    throw e;
  }

  // Make all paths in the configuration file absolute
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
  // Basepaths
  for (index in data.basePaths) {
    data.basePaths[index] = configFileDirectory + '/' + data.basePaths[index];
  }

  return data;
};

/**
 * Returns an object representing the configuration for the current venus run
 *
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
    _.extend(mergedConfig, this.parseConfigFile(configFiles[i]));
  }

  return mergedConfig;
};

Object.seal(module.exports);
