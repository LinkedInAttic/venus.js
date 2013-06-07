/**
 * @author LinkedIn
 */
var path         = require('path'),
    configHelper = require('../../lib/config');

module.exports.fakeCwd = function() {
  return path.resolve(__dirname + '/../data/sample_fs/projects/webapp/base/');
};

module.exports.testConfig = function() {
  configHelper.cwd = module.exports.fakeCwd();
  return configHelper.getConfig();
};

module.exports.sampleTests = function(testPath) {
  if (!testPath) {
    return path.resolve(__dirname + '/../data/sample_tests');
  } else {
    return path.resolve(__dirname + '/../data/sample_tests/' + testPath);
  }
};

module.exports.codeCoverageData = function (name) {
  return require(path.resolve(__dirname, '..', 'data', 'sample_code_coverage', name + '.json'));
};

module.exports.path = function () {
  var args = Array.prototype.slice.call(arguments, 0);

  args = [__dirname, '..'].concat(args);

  return path.resolve.apply(path, args);
};
