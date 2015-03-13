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
 * File system helpers
 */
var fs        = require('fs'),
    _         = require('underscore'),
    i18n      = require('./i18n'),
    pathm     = require('path'),
    constants = require('../constants'),
    logger    = require('./logger');

/**
 * Search a specified folder, and all parent folders, for a venus config directory
 *
 * @param {string} path - the directory to look for the file in
 * @param {string} target - the desired file
 * @param {boolean} multi - if true, stop at the first find; otherwise, keep searching recursively.
 * @param {string[]} results - the accumulator (list of paths of the found files)
 *
 * @returns {string[]} results - the list of paths of the found files
 */
function searchUpwardsForFile (path, target, multi, results) {
  var checkPath = path + '/' + target,
      split     = path.split('/'),
      parent    = split.slice(0, -1).join('/');

  results = results || [];

  if (!path.length) {
    path = '/';
  }

  logger.debug( i18n('Looking for %s in %s', target, path) );

  if (fs.existsSync(checkPath)) {
    results.push(pathm.resolve(checkPath));
  }

  if (path.length === 1) {
    return results;
  } else if (multi) {
    return searchUpwardsForFile(parent, target, multi, results);
  } else {
    return results;
  }
}

/**
 * Get first valid path from array
 *
 * @param {string[]} paths - an array of all potential paths
 *
 * @returns {*} validPath - the first valid path if found; otherwise, 'undefined'
 */
function getFirstValidPath (paths) {
  var validPath;

  // Force paths to be an array
  if (!Array.isArray(paths)) {
    paths = [paths];
  }

  paths.some(function (path) {
    if (fs.existsSync(path)) {
      validPath = path;
      return true;
    }
  });

  return validPath;
}

/**
 * Builds out the temp directory for the test.
 * @param {object}
 * @param {string='.venus_temp'} dirname the name of the directory
 * @param {number=0} port the port the test is running on
 */
function getTempDir(options) {
  options = options || {};
  _.defaults(options, {
    dirname: '.venus_temp',
    port: 0
  });

  var tempDir = options.dirname;

  if (options.port) {
    tempDir += options.port;
  }

  return tempDir;
}

/**
 * Resolves the location of any sub directories within a test given test with a
 * unique id. It does so by taking the unique id, alongside the temp directory,
 * and returning a function to minimize the look up of the base temp directory.
 * The function returned takes in a string of n arguments containing the rest of
 * the path. If no unique id has been provided, it will fallback to the port
 * provided in the constants. If for some stupid reason that doesn't exist,
 * it'll fallback to an empty string.
 *
 * @example
 * var tempDir = resolveTempDir(1234);
 * // outputs: /temp/venus/run-1234/foo/bar
 * tempDir('foo', 'bar');
 *
 * @param {number} id unique id for the directory - falls back to port constant
 * @return {function} the function when executes takes in the full path
 */
function resolveTempDir(id) {
  var tempDir = getTempDir({
        dirname: constants.tempDir,
        port: id || constants.port || ''
      }),
      start = [tempDir];

  return function() {
    var end = Array.prototype.slice.call(arguments);
    return pathm.resolve.apply(pathm.resolve, start.concat(end));
  }
}

module.exports.getFirstValidPath = getFirstValidPath;
module.exports.searchUpwardsForFile = searchUpwardsForFile;
module.exports.getTempDir = getTempDir;
module.exports.resolveTempDir = resolveTempDir;
Object.seal(module.exports);
