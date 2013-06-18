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
'use strict';

// @author LinkedIn

// Controls a phantomJS instance to run tests
var phantom     = require('phantomjs-please'),
    log         = require('../util/logger'),
    i18n        = require('../util/i18n'),
    fs          = require('fs'),
    cachedBinaryPath;

// Constructor for Uac
function Uac() {}

// Initialize Uac object
Uac.prototype.init = function(url, options) {
  var binaryPath;

  this.url = url;

  if (options && options.binaryPath) {
    if (cachedBinaryPath) {
      binaryPath = cachedBinaryPath;
    } else {
      cachedBinaryPath = binaryPath = this.getFirstValidPath(options.binaryPath);
    }
  }

  phantom.setup( { phantomBinaryPath: binaryPath } );
  this.browser = phantom.createBrowser();
  return this;
};

// Get first valid path from array
Uac.prototype.getFirstValidPath = function (paths) {
  var validPath;

  if (!Array.isArray(paths)) {
    paths = [paths];
  }

  paths.some(function (path) {
    if (fs.existsSync(path)) {
      validPath = path;
      return true;
    }
  });

  return validPath;
};

// Run a test using PhantomJS
Uac.prototype.runTest = function( url ) {
  var browser = this.browser,
      loadUrl = url || this.url;

  log.info(i18n('Phantom browser is loading %s', loadUrl));
  browser.navigate( loadUrl );
  return this;
};

// Shutdown
Uac.prototype.shutdown = function() {
  this.browser.kill();
  return this;
};

// Create a new instance of Uac
function create(url, options) {
  var instance = new Uac();
  instance.init(url, options);
  return instance;
}

module.exports.Uac = Uac;
module.exports.create = create;
Object.seal(module.exports);
