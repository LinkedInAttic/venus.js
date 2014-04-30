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
 * Helper functions used to parse parameters defined in test fixtures
 */
var _      = require('underscore'),
    fs     = require('fs'),
    logger = require('./logger'),
    i18n   = require('./i18n');

/**
 * Parses string to hash
 *
 * @param {string} str - string to parse
 *
 * @returns {Object} hash - hash of all the param names and their values
 */
function parseCommentsFromString (str) {
  var blockRegex   = /\/\*([\s\S]*?)\*\//g,
      blockMatches = str.match(blockRegex) || [],
      hash         = {};

  blockMatches.forEach(function (g) {
    // _(hash).extend(parseBlock(g));
    hash = parseBlock(g, hash);
  });

  return hash;
}

/**
 * Parses a comment block
 *
 * @param {string} block - the comment block to parse
 * @param {Object} [hash] - the hash of parameters to add the params to
 *
 * @returns {Object} configBlock - hash of all the param names and their values
 */
function parseBlock (block, hash) {
  var paramRegex  = /@.*/g,
      configBlock = hash || {},
      paramMatches = block.match(paramRegex);

  if (paramMatches) {
    paramMatches.forEach(function (p) {
      var param        = parseParam(p),
          name         = param.name,
          value        = param.value,
          currentValue = configBlock[name];

      // If this is the first time we've seen this config property, add it.
      // Otherwise, if the current value is a string, move it to an array
      // if it's already in an array, then append to that array
      if (currentValue === undefined) {
        configBlock[name] = value;
      } else if (typeof currentValue === 'string') {
        configBlock[name] = [currentValue, value];
      } else if (currentValue.length !== undefined) {
        configBlock[name].push(value);
      }
    });
  }

  return configBlock;
}

/**
 * Parses a parameter
 *
 * @param {string} param - the parameter to parse
 *
 * @returns {Object} parsedParams - the name and value of the parameter
 */
function parseParam (param) {
  var kvRegex     = /([\w-]+)\s+(.+)?/,
      kvMatches   = param.match(kvRegex),
      parsedParams = {
        name  : null,
        value : null
      },
      name,
      value;

  if (!kvMatches) {
    return parsedParams;
  }

  name  = kvMatches[1];
  value = kvMatches[2];

  // Remove whitespace from name and value
  if (typeof name === 'string') {
    parsedParams.name = name.trim();
  }

  if (typeof value === 'string') {
    parsedParams.value = value.trim();
  }

  return parsedParams;
}

module.exports.parseStr = parseCommentsFromString;
Object.seal(module.exports);
