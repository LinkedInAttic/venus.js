/**
 * @author LinkedIn
 */
var pathm = require('path'),
    config = require('../../lib/config');

module.exports.fakeCwd = function() {
  return pathm.resolve(__dirname + '/../data/sample_fs/projects/webapp/base/');
};

module.exports.testConfig = function() {
  return new config.Config(module.exports.fakeCwd());
}

module.exports.sampleTests = function(path) {
  if(!path) {
    return pathm.resolve(__dirname + '/../data/sample_tests');
  } else {
    return pathm.resolve(__dirname + '/../data/sample_tests/' + path);
  }
}
