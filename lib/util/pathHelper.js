/**
 * Path helpers
 * @author LinkedIn
 */
var path   = require('path'),
    i18n   = require('./i18n'),
    logger = require('./logger');

/**
 * Path object
 */
function PathHelper(path) {
  this.path = path;
}

/**
 * Manipulate a path - move up N directories
 */
PathHelper.prototype.up = function() {
  var path = this.path.split('/');
  path.pop(1);
  this.path = path.join('/');
  return this;
}

/**
 * To string function
 */
PathHelper.prototype.toString = function() {
  return this.path;
}

/**
 * Constructor helper
 */
function createPathHelper(path) {
  return new PathHelper(path);
}

module.exports = createPathHelper;
Object.seal(module.exports);
