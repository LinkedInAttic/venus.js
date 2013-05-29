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

// Helper functions used to parse parameters defined in test fixtures

var _        = require('underscore'),
    fs       = require('fs'),
    logger   = require('./logger'),
    i18n     = require('./i18n');

// Parse string to hash
function parseCommentsFromString(str) {
  var blockRegex   = /\/\*([\s\S]*)\*\//,
      hash         = {},
      blockMatches;

  blockMatches = str.match(blockRegex) || [];

  blockMatches.forEach(function (g) {
    _(hash).extend(parseBlock(g));
  });

  return hash;
}

// Parse a comment block
function parseBlock (block) {
  var paramRegex    = /@.*/g,
      paramMatches,
      configBlock = {},
      param;

  paramMatches = block.match(paramRegex);

  if(paramMatches) {
    paramMatches.forEach(function(p) {
      var currentValue,
          name,
          value;

      param         = parseParam(p);
      name          = param.name;
      value         = param.value;
      currentValue  = configBlock[name];

      // If this is the first time we've seen this config property, add it.
      // Otherwise, if the current value is a string, move it to an array
      // if it's already in an array, then append to that array
      if(typeof currentValue === 'undefined') {
        configBlock[name] = value;
      } else if(typeof currentValue === 'string') {
        configBlock[name] = [currentValue, value];
      } else if(typeof currentValue.length !== 'undefined') {
        configBlock[name].push(value);
      }
    });
  }

  return configBlock;
}

// Parse a parameter
function parseParam(param) {
  var kvRegex     = /([\w-]+)\s+(.+)?/,
      kvMatches   = param.match(kvRegex),
      name        = kvMatches[1],
      value       = kvMatches[2];

  if(typeof name === 'string') {
    name = name.trim();
  }

  if(typeof value === 'string') {
    value = value.trim();
  }

  return {
    name:  name,
    value: value
  };
};

module.exports.parseStr = parseCommentsFromString;
Object.seal(module.exports);
