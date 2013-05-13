/**
 * @author LinkedIn
 */
var pathm = require('path'),
    configHelper = require('../../lib/config');

module.exports.fakeCwd = function() {
  return pathm.resolve(__dirname + '/../data/sample_fs/projects/webapp/base/');
};

module.exports.testConfig = function() {
  configHelper.cwd = module.exports.fakeCwd();
  return configHelper.getConfig();
};

module.exports.sampleTests = function(path) {
  if (!path) {
    return pathm.resolve(__dirname + '/../data/sample_tests');
  } else {
    return pathm.resolve(__dirname + '/../data/sample_tests/' + path);
  }
};

module.exports.codeCoverageData = function (name) {
  return require(pathm.resolve(__dirname, '..', 'data', 'sample_code_coverage', name + '.json'));
};
