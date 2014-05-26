'use strict';

var fs   = require('./fs');
var path = require('path');
var q    = require('q');

module.exports = {
  /**
   * Filename for Venus configuration files
   * @property {string} rcfile
   * @constant
   * @default
   */
  rcfile: '.venusrc',

  /**
   * Load .venusrc files
   * @param {string} startPath - Path to start searching from
   * @return {promise}
   */
  loadRc: function (startPath) {
    var def = q.defer();

    this.locateRcFiles(startPath).then(function (paths) {
      def.resolve(paths.map(function (p) {
        var obj = null;

        try {
          obj = require(p);
          obj.__pathOnDisk = p;
        } catch (e) {
          console.error('Skipping', p, 'cannot be require()ed');
        }

        return obj;
      }).filter(function (obj) {
        return obj !== null;
      }));
    });

    return def.promise;
  },

  /**
   * Search recursively upwards for .venusrc files
   * @param {string} startPath - Path to start searching from
   * @return {promise} Array of absolute paths to .venusrc files
   */
  locateRcFiles: function (startPath) {
    return this.pickRcFiles(this.buildRcLookupPaths(startPath));
  },

  /**
   * Filter out paths which do not contain a .venusrc file
   * @param {array} paths - Paths to consider
   * @return {promise} Array of absolute paths to .venusrc files
   */
  pickRcFiles: function (paths) {
    var def = q.defer();

    q.all(paths.map(function (p) {
      return this.dirRcPath(p);
    }.bind(this))).then(function (paths) {
      def.resolve(paths.filter(function (p, idx) {
        if (p === null || paths.indexOf(p) !== idx) {
          return false; 
        } else {
          return true;
        }
      }));
    });

    return def.promise;
  },

  /**
   * Build path lookup chain for finding rc files in filesystem
   * @param {string} startPath - Path to start from
   * @param {array} paths - Array of paths that will be returned
   * @return {array} Array of paths
   */
  buildRcLookupPaths: function (startPath, paths) {
    var dir     = (startPath || this.cwd);
    var nextDir = path.resolve(dir, '..');
    var home    = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

    paths = paths || [];
    paths.unshift(dir);

    if (nextDir !== dir) {
      return this.buildRcLookupPaths(nextDir, paths);
    } else {
      paths.unshift(home);
      return paths;
    }
  },

  /**
   * Determine if a directory contains a valid .venusrc file
   * @param {string} directory - The directory to check
   * @return {promise} resolves with null or absolute path to .venusrc file
   */
  dirRcPath: function (directory) {
    var def      = q.defer();
    var rcpath   = path.resolve(directory, this.rcfile);

    fs.exists(rcpath, function (exists) {
      if (exists) {
        def.resolve(rcpath);
      } else {
        def.resolve(null);
      }
    });

    return def.promise;
  }

};
