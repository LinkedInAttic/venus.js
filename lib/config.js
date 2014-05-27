'use strict';

var fs          = require('./util/fs');
var rc          = require('./util/rc');
var annotations = require('./util/annotations');
var ConfigCtx   = require('./ConfigCtx');
var q           = require('q');

module.exports = {

  /**
   * Cache of configuration objects. Each test file may result in a different
   * configuration, as a result of local config files or in file configuration
   * annotations.
   * @property {object} cache - Keys are file/folder paths
   * @default
   */
  cache: {},

  /**
   * Current working directory. This will typically be the path from which Venus was
   * instantiated.
   * @property {string} cwd - Absolute filesystem path
   * @default
   */
  cwd: process.cwd(),


  /**
   * Build configuration by parsing available inputs
   * @param {string} startPath - The starting path to parse from. Can be a file or folder.
   */
  ctx: function (startPath) {
    var relativeTo = startPath || this.cwd;
    var def        = q.defer();
    var cachedCtx  = this.cache[relativeTo];

    if (cachedCtx) {
      def.resolve(cachedCtx);
    }

    q.all([rc.loadRc(relativeTo), annotations.parse(relativeTo)]).then(function (rcs, ant) {
      this.cache[startPath] = new ConfigCtx(rcs, ant);
      def.resolve(this.cache[startPath]);
    });

    return def.promise;
  }
};


