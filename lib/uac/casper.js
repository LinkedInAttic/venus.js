/*
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 **/
// Controls a CasperJS instance to run tests  
  
var exec        = require('child_process').spawn,
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
  this.output = '';
};

// Run a test using PhantomJS
CasperRunner.prototype.runTest = function() {
  var testPath = this.test.path,
      self    = this,
      done = this.done,
      args = '',
      argsList = ['test'];

  if(typeof this.done === 'function') {
    done = this.done;
  } else {
    done = function() {};
  }

  if(this.test.annotations['venus-pre']) {
    args += '--pre=' + this.test.directory + '/' + this.test.annotations['venus-pre'];
    argsList.push('--pre=' + this.test.directory + '/' + this.test.annotations['venus-pre']);
  }

  if(this.test.annotations['venus-post']) {
    args += '--post=' + this.test.directory + '/' + this.test.annotations['venus-post'];
    argsList.push('--post=' + this.test.directory + '/' + this.test.annotations['venus-post']);
  }

  argsList.push(testPath);
  this.process = exec('casperjs',argsList);

  this.process.stdout.on('data', function (data) {
    self.output += data;
  });

  this.process.stderr.on('data', function (stderr) {
    if(stderr.indexOf('casperjs: command not found') > -1) {
      logger.error( i18n('CasperJS not installed. Install and try again.') );
    } else {
      logger.error( i18n(stderr) );
    }
  });

  this.process.on('exit', function (code) {
    console.log('=====================');
    console.log('CasperJS Test Output:');
    console.log('---------------------');
    console.log(self.output);
    done();
  });
}

// Shutdown
CasperRunner.prototype.shutdown = function() {
  //this.proccess.kill('SIGHUP');
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
