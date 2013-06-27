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

// File system helpers

var fs     = require('fs'),
    i18n   = require('./i18n'),
    pathm  = require('path'),
    logger = require('./logger');

// Search a specified folder, and all parent folders, for a venus config directory
function searchUpwardsForFile(path, target, multi, results) {
  var checkPath = path + '/' + target,
      split     = path.split('/'),
      parent    = split.slice(0, -1).join('/'),
      results   = results || [];

  if(path.length === 0) {
    path = '/';
  }

  logger.debug( i18n('Looking for %s in %s', target, path) );

  if(fs.existsSync(checkPath)) {
    results.push(pathm.resolve(checkPath));
  }

  if(path.length === 1) {
    return results;
  } else if(multi) {
    return searchUpwardsForFile(parent, target, multi, results);
  } else {
    return results;
  }
}

// Get first valid path from array
function getFirstValidPath(paths) {
  var validPath;

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

module.exports.getFirstValidPath = getFirstValidPath;
module.exports.searchUpwardsForFile = searchUpwardsForFile;
Object.seal(module.exports);
