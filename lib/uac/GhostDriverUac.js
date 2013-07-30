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

  this.startAttempts = 0;

  if (this.server.indexOf('http://') !== 0) {
    this.server = 'http://' + this.server;
  }


  if (options && options.binaryPath) {
    this.binaryPath = fsHelper.getFirstValidPath(options.binaryPath);
  }

  this.options = options;
}

/**
 * Spawn PhantomJS process
 */
GhostDriverUac.prototype.spawn = function (binary) {

  this.process = spawn(binary, ['--webdriver=' + this.options.port]);

},

/**
 * Start the UAC
 */
GhostDriverUac.prototype.start = function () {
  var def = deferred(),
      binary = this.binaryPath || 'phantomjs',
      stdout = '',
      stderr = '',
      startTime = new Date();

  // First, try to kill other phantomjs processes
  spawn('killall', ['-9', 'phantomjs']).on('exit', function () {
    // Now, go ahead and start a new phantomjs process
    spawnPhantom.call(this);
  }.bind(this));

  function spawnPhantom () {
    this.process = spawn(binary, ['--webdriver=' + this.options.port]);
    this.process.on('exit', function (code) {

      // Invalid phantomjs path
      if (code === 127) {
        def.reject(new Error('PhantomJS not found at path `' + binary + '`'));
        return;
      }

      // Unable to start process (other error)
      if (new Date() - startTime < 500) {
        // assume error since this is a short lived process
        // try to restart phantom up to 5 times
        def.reject(new Error(stdout));
        return;
      }

      // Print phantomjs standard output to debug log
      log.debug('phantomjs stdout: ' + stdout);

      // Log error if there is any standard error output
      if (stderr.length > 1) {
        log.error('phantomjs stderr: ' + stderr);
      }

    }.bind(this));

    // Note: never seen a case where phantomjs process fires the error event,
    // but catching it here just in case
    this.process.on('error', function (e) {
      def.reject(e);
    });

    // Log phantomjs process stdout
    this.process.stdout.on('data', function (data) {
      stdout += data;
    });

    // Log phantomjs process stderr
    this.process.stderr.on('data', function (data) {
      stderr += data;
    });

    // Give PhantomJS a second to start and then try to kick off the webdriver client
    setTimeout(function () {
      this.driver = new webdriver.Builder()
                                 .usingServer(this.server)
                                 .build();

      this.driver.manage().timeouts().implicitlyWait(5000);
      def.resolve(this);
    }.bind(this), 2000);
  }

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
        log.error('PhantomJS unable to load test URL: ' + loadUrl + ' (timeout)');
        def.reject(new Error('PhantomJS unable to load test URL: ' + loadUrl + ' (timeout)'));
      });

  return def.promise;
};

module.exports = GhostDriverUac;
Object.seal(module.exports);
