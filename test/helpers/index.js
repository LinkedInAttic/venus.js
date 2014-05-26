var path   = require('path');

module.exports = {
  /**
   * Require lib module to test
   * @param {string} modulePath - path to module, relative to project lib directory
   */
  r: function (modulePath) {
    return require(path.resolve(__dirname, '..', '..', 'lib', modulePath));
  },

  /**
   * Get path
   */
  path: function () {
    var args = Array.prototype.slice.call(arguments, 0);

    args.unshift(__dirname, '..');

    return path.resolve.apply(path, args);
  },

  /**
   * Sample project fixture
   * @param {string} project - the project name, mapping to folder under /test/fixtures/projects/
   */
  projectPath: function (project) {
    return this.path('fixtures', 'projects', project);
  },

  /**
   * Assert module
   */
  assert: require('./customAssert')
};
