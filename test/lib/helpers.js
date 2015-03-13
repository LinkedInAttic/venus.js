/**
 * @author LinkedIn
 */
var path         = require('path'),
    configHelper = require('../../lib/config'),
    spawn        = require('child_process').spawn,
    JSON5        = require('json5'),
    deferred     = require('deferred'),
    fstools      = require('fs-tools'),
    fs           = require('fs');

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

module.exports.appDir = path.resolve(__dirname, '..', '..');
module.exports.binPath = path.resolve(__dirname, '..', '..', 'bin', 'venus');

module.exports.runVenus = function (args, showStdOut) {
  var process = spawn(module.exports.binPath, args);

  if (showStdOut) {
    process.stdout.on('data', function (data) {
      console.log(data.toString());
    });
  }

  return process;
};

module.exports.path = function () {
  var args = Array.prototype.slice.call(arguments, 0);

  args = [__dirname, '..'].concat(args);

  return path.resolve.apply(path, args);
};

module.exports.dirOps = function(directory) {
  return {
    remove: function() {
      var def = deferred();

      fstools.remove(directory, function() {
        def.resolve();
      });

      return def.promise;
    },

    make: function() {
      var def = deferred();

      fstools.mkdir(directory, '0755', function() {
        def.resolve();
      });

      return def.promise;
    },

    exists: function() {
      var def = deferred();

      fs.exists(directory, function(exists) {
        def.resolve(exists);
      });

      return def.promise;
    }
  };
};
