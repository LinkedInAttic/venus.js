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

var webdriver   = require('selenium-webdriver'),
    log         = require('../util/logger'),
    i18n        = require('../util/i18n'),
    deferred    = require('deferred'),
    fsHelper    = require('../util/fsHelper'),
    spawn       = require('child_process').spawn;

/**
 * Controls a webdriver script
 */
function GhostDriverUac(options) {
  this.server = [
    options.host || 'http://localhost',
    ':',
    options.port
  ].join('');

  if (this.server.indexOf('http://') !== 0) {
    this.server = 'http://' + this.server;
  }


  if (options && options.binaryPath) {
    this.binaryPath = fsHelper.getFirstValidPath(options.binaryPath);
  }

  this.options = options;
}

/**
 * Start the UAC
 */
GhostDriverUac.prototype.start = function () {
  var def = deferred(),
      binary = this.binaryPath || 'phantomjs';

  this.process = spawn(binary, ['--webdriver=' + this.options.port]);
  this.process.on('exit', function (code) {
    if (code === 127) {
      def.reject({message:'PhantomJS not found'});
    }
  });

  this.process.on('error', def.reject);


  setTimeout(function () {
    this.driver = new webdriver.Builder()
                               .usingServer(this.server)
                               .build();

    this.driver.manage().timeouts().implicitlyWait(5000);
    def.resolve(this);
  }.bind(this), 500);

  return def.promise;
};

/**
 * Stop the UAC
 */
GhostDriverUac.prototype.stop = function () {
  var def = deferred();

  this.driver.quit();

  this.process.on('exit', function () {
    def.resolve();
  });

  this.process.kill('SIGTERM');
  // setTimeout(function () {
    // console.log('reject');
    // def.reject();
  // }, 1000);


  return def.promise;
};

/**
 * Run a test
 * @param {String} url test url
 */
GhostDriverUac.prototype.loadUrl = function (url) {
  var browser = this.driver,
      loadUrl = url,
      def = deferred();

  browser.get(loadUrl).then(
    function () {

    },
    function (e) {
      log.error(loadUrl + ': ' + e.message);
    }
  );

  browser.findElement(webdriver.By.id('test-done-marker'))
      .then(function () {
        def.resolve();
      }, function () {
        log.error(loadUrl + ' test timeout');
        def.reject(loadUrl + ' test timeout');
      });

  return def.promise;
};

module.exports = GhostDriverUac;
Object.seal(module.exports);
