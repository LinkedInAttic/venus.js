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

var webdriver            = require('webdriverjs'),
    sauceConnectLauncher = require('sauce-connect-launcher'),
    logger               = require('../util/logger'),
    i18n                 = require('../util/i18n');

/**
 * Controls a webdriver script
 */
function SauceLabsUac() {}

/**
 * Initialize
 */
SauceLabsUac.prototype.init = function(url, options) {
  this.url     = url;
  this.client  = webdriver.remote({
    desiredCapabilities: {
      browserName: options.browser,
      version: options.version,
      username: options.username,
      accessKey: options.accessKey,
      platform: options.platform
    },
    host: options.host
  });

  this.options = options;

  this.sauceConnectLauncherOptions = {
    username: options.username,
    accessKey: options.accessKey,
    verbose: false,
    logger: logger.info,
    no_progress: false
  };

  return this;
};

/**
 * Run a test
 * @param {Function} cb callback for when test has finished
 * @param {String} url test url
 */
SauceLabsUac.prototype.runTest = function(cb, url) {
  var browser = this.client,
      loadUrl = url || this.url,
      done;

  if(typeof cb === 'function') {
    done = cb;
  } else {
    done = function() {};
  }

  logger.info( i18n('Web Driver is loading %s', loadUrl) );

  sauceConnectLauncher(this.sauceConnectLauncherOptions, function (err, sauceConnectProcess) {
    logger.info(i18n('Starting Sauce Connect process'));
    browser
      .init()
      .url( loadUrl )
      .pause( 3000 )
      .end(function() {
        logger.info(i18n('Closing Sauce Connect process'));
      });
  });

  return this;
};

/**
 * Create a new instance of SauceLabsUac
 */
function create(url, options) {
  var instance = new SauceLabsUac();
  instance.init(url, options);
  return instance;
}

module.exports.SauceLabsUac = SauceLabsUac;
module.exports.create = create;
Object.seal(module.exports);
