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
   * Sample spec file path
   * @param {string} p - The relative path to the spec file, under /test/fixtures/specs
   * @return {string} absolute path to spec
   */
  specPath: function () {
    var args = Array.prototype.slice.call(arguments, 0);

    args.unshift('fixtures', 'specs');

    return this.path.apply(this, args);
  },


  /**
   * Assert module
   */
  assert: require('./customAssert')
};
