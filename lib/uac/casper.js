// Controls a CasperJS instance to run tests  
  
var exec        = require('child_process').exec,
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n'),
    path        = require('path');

// Constructor for CasperRunner  
function CasperRunner() {};

// Initialize CasperRunner object
CasperRunner.prototype.init = function(testPath, doneCallback) {
  this.testPath = testPath;
  this.process = null;
  this.done = doneCallback;
};

// Run a test using PhantomJS
CasperRunner.prototype.runTest = function() {
  var testPath = this.testPath,
      self    = this,
      done = this.done;

  if(typeof this.done === 'function') {
    done = this.done;
  } else {
    done = function() {};
  }

  this.proccess = exec('casperjs ' + testPath,
    function (error, stdout, stderr) {
      if (stderr) {
        if(stderr.indexOf('casperjs: command not found') > -1) {
          logger.error( i18n('CasperJS not installed') );
        } else {
          logger.error( i18n(stderr) );
        }
      } else {
        console.log(stdout);
      }
      done();
  });
}

// Shutdown
CasperRunner.prototype.shutdown = function() {
  this.proccess.kill('SIGHUP');
};

// Create a new instance of CasperRunner  
function create(testPath, doneCallback) {
  var instance = new CasperRunner();
  instance.init(testPath, doneCallback);
  return instance;
}

module.exports.CasperRunner = CasperRunner;
module.exports.create = create;
Object.seal(module.exports);
