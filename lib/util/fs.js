// Provide a promise based interface to node fs module
var fs = require('fs');
var q  = require('q');

module.exports = fs;

/**
 * Check if path is a file
 * @param {string} path - The path to check
 * @return {promise}
 */
fs.isFile = function (path) {
  return this.pStat(path, 'isDirectory');
};

/**
 * Check if path is a directory
 * @param {string} path - The path to check
 * @return {promise}
 */
fs.isDirectory = function (path) {
  return this.pStat(path, 'isDirectory');
};

/**
 * Call method on path stat object
 * @param {string} method - The method to call
 * @return {promise}
 */
fs.pStat = function (path, method) {
  var def = q.defer();

  fs.stat(path, function (err, stat) {
    if (err) {
      def.reject(err);
    } else if (typeof stat[method] !== 'function') {
      def.reject(new Error('Stat object does not contain method ' + method));
    } else {
      def.resolve(stat[method]());
    }
  });

  return def.promise;
};
