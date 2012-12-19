// Controls a CasperJS instance to run tests  
  
var exec        = require('child_process').exec,
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n'),
    path        = require('path');

// Constructor for CasperRunner  
function CasperRunner() {};

// Initialize CasperRunner object
CasperRunner.prototype.init = function(test, doneCallback) {
  this.test = test;
  this.process = null;
  this.done = doneCallback;
};

// Run a test using PhantomJS
CasperRunner.prototype.runTest = function() {
  var testPath = this.test.path,
      self    = this,
      done = this.done,
      args = '';

  if(typeof this.done === 'function') {
    done = this.done;
  } else {
    done = function() {};
  }

  if(this.test.annotations['venus-pre']) {
    args += ' --pre=' + this.test.directory + '/' + this.test.annotations['venus-pre'];
  }

  if(this.test.annotations['venus-post']) {
    args += ' --post=' + this.test.directory + '/' + this.test.annotations['venus-post'];
  }
  console.log('casperjs test ' + args + ' ' + testPath);
  this.proccess = exec('casperjs ' + testPath + args,
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
function create(test, doneCallback) {
  var instance = new CasperRunner();
  instance.init(test, doneCallback);
  return instance;
}

module.exports.CasperRunner = CasperRunner;
module.exports.create = create;
Object.seal(module.exports);
