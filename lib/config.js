/**
 * Parse JavaDoc style comments
 * @author LinkedIn
 */
var _   = require('underscore'),
    fs  = require('fs');

/**
 * Locate the closest venus config directory.
 * Search base directory first, then recursively search
 * parent directories.
 * Next, look in user's home directory.
 * Finally, look in venus global directory
 */
function findConfigDirectory( base ) {
  var configDirName = '.venus',
      foundDir      = false,
      configDir;

  function lookUp( base ) {
    var path    = base + '/' + configDirName + '/',
        split   = base.split('/'),
        parent  = split.slice(0, -1).join('/');

    if(base.length === 0) {
      base = '/';
    }

    console.log('searching', base);
    if(fs.existsSync(path)) {
      foundDir = true;
      configDir = path;
    } else {
      if(split.length > 1) {
      lookUp(parent);
      }
    }
  }

  lookUp(base);

  if(foundDir) {
    console.log('found dir!', configDir);
  } else {
    console.log('could not find dir');
  }
}

/**
 * Parse string to comment objects
 */
function parseComments(str) {
  var blockRegex    = /\/\*([\s\S]*)\*\//;
  var blockMatches;
  var config = {};

  blockMatches = str.match(blockRegex);

  blockMatches.forEach(function(g, idx) {
    _(config).extend( parseBlock(g) );
  });

  return config;
}

/**
 * Parse a comment block
 */
function parseBlock(block) {
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
}

/**
 * Parse a param
 */
function parseParam(param) {
  var kvRegex     = /@(.*?)\s+?(.*)/,
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
}

module.exports.parseComments = parseComments;
module.exports.findConfigDirectory = findConfigDirectory;
Object.seal(module.exports);
