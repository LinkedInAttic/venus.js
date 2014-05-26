var path  = require('path'),
    merge = require('deepmerge');

module.exports = function (customConfigPath, cwd, dir) {
  var baseConfig, customConfig;

  cwd = cwd || process.cwd();
  dir = dir || __dirname;

  // Default, built-in config
  baseConfig = require(path.resolve(dir, '../.venusrc'));

  // Custom config
  try {
    if (customConfigPath) {
      customConfig = require(path.resolve(cwd, customConfigPath));
    } else {
      customConfig = require(path.resolve(cwd, '.venusrc'));
    }
  } catch (e) {
    // unable to load custom config
    console.log(e);
    customConfig = {};
  }

  return merge(baseConfig, customConfig);
};

