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

/**
 * @overview Controls a selenium webdriver script
 */

var webdriver   = require('selenium-webdriver'),
    log         = require('../util/logger'),
    portscanner = require('portscanner'),
    deferred    = require('deferred'),
    fsHelper    = require('../util/fsHelper'),
    spawn       = require('child_process').spawn,
    http        = require('http');

/**
 * Sets up a GhostDriver UAC (User account control) with options
 * @param {Object} options
 */
function GhostDriverUac(options) {
  this.host = options.host || 'localhost';
  this.port = options.port || 8910;

  this.startAttempts = 0;

  if (options && options.binaryPath) {
    this.binaryPath = fsHelper.getFirstValidPath(options.binaryPath);
  }

  this.options = options;
}

/**
 * Starts the UAC, spawns phantom processes
 * @returns {Object} a promise
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
    portscanner.findAPortNotInUse(this.port,
                                  this.port + 2000,
                                  this.host,
                                  function(err, port) {
      this.port = port;
      this.server = 'http://' + this.host + ':' + this.port;
      log.debug('Trying to create PhontamJS Selenium server at', this.server);
      spawnPhantom.call(this);
    }.bind(this));
  }.bind(this));

  function spawnPhantom () {
    this.process = spawn(binary, ['--webdriver=' + this.port]);
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

    // Wait for PhantomJS to start...
    this.waitForProcessStart().then(function () {
        this.driver = new webdriver.Builder()
                                   .usingServer(this.server)
                                   .build();

        this.driver.manage().timeouts().implicitlyWait(5000);
        def.resolve(this);
    }.bind(this), function (err) {
      def.reject(err);
    });
  }

  return def.promise;
};

/**
 * Polls GhostDriver server for valid responses
 * @returns {Object} a promise
 */
GhostDriverUac.prototype.waitForProcessStart = function () {
  var def, options, request, maxAttempts, attempts;

  maxAttempts = 300;
  attempts = 0;

  def = deferred(),
  options = {
    port: this.port,
    host: this.host,
    path: '/session',
    method: 'POST'
  };

  function check() {
    request = http.request(options, function (response) {
      if (response.statusCode === 400) {
        log.debug('PhantomJS webdriver is available! Proceed...');
        def.resolve();
      }
    });

    request.on('error', function (err) {
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(function () {
          check();
        }, 50);
      } else {
        throw Error('Unable to connect to PhantomJS webdriver');
      }
    });

    request.end();
  }

  log.debug('Sending HTTP request to see if PhantomJS webdriver server is available...');
  check();

  return def.promise;
};


/**
 * Stop the UAC
 * @returns {Object} a promise
 */
GhostDriverUac.prototype.stop = function () {
  var def = deferred();

  this.driver.quit();

  this.process.on('exit', function () {
    def.resolve();
  });

  this.process.kill('SIGTERM');

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
