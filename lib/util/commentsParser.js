/**
 *
 * @author LinkedIn
 */
var _        = require('underscore'),
    fs       = require('fs'),
    logger   = require('./logger'),
    i18n     = require('./i18n');

/**
 * Parse string to hash
 */
function parseCommentsFromString(str) {
  var blockRegex   = /\/\*([\s\S]*)\*\//,
      hash         = {},
      blockMatches;

  blockMatches = str.match(blockRegex) || [];

  blockMatches.forEach(function(g, idx) {
    _(hash).extend( parseBlock(g) );
  });

  return hash;
}

/**
 * Parse a comment block
 */
function parseBlock (block) {
  var paramRegex    = /@.*/g,
      paramMatches,
      configBlock = {},
      param;

  paramMatches = block.match(paramRegex);

  paramMatches.forEach(function(p) {
    var currentValue,
        name,
        value;

    param         = parseParam(p);
    name          = param.name;
    value         = param.value;
    currentValue  = configBlock[name];

    // If this is the first time we've seen this config property, add it
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

  return configBlock;
};

/**
 * Parse a param
 */
function parseParam (param) {
  var kvRegex     = /([\w-]+)\s+([\s\w/-~_\.\"]+)?/,
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
