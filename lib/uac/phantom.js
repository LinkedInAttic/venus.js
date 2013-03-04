'use strict';

// @author LinkedIn

// Controls a phantomJS instance to run tests
var phantom     = require('phantomjs-please'),
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n'),
    path        = require('path');

// Constructor for Uac
function Uac() {}

// Initialize Uac object
Uac.prototype.init = function( url, binary ) {
  this.url = url;
  this.binary = binary;
  phantom.setup( { phantomBinaryPath: binary } );
  this.browser = phantom.createBrowser();
  return this;
};

// Run a test using PhantomJS
Uac.prototype.runTest = function( url ) {
  var browser = this.browser,
      loadUrl = url || this.url;

  logger.info(i18n('Phantom browser is loading %s', loadUrl));
  browser.navigate( loadUrl );
  return this;
};

// Shutdown
Uac.prototype.shutdown = function() {
  this.browser.kill();
  return this;
};

/**
 * Manager which creates UACs
 * @constructor
 */
function Manager() {}

/**
 * Handles the tests-loaded event from Executor.
 * @param {Array} tests array of loaded tests
 * @param {Object} options command line flags
 * @method Manager#onTestsLoaded
 */
Manager.prototype.onTestsLoaded = function (tests, options) {
  var phantomPath;

  logger.verbose( i18n('Creating phantom runners') );

  // resolve path to phantom binary
  phantomPath = options.phantom;

  if (phantomPath === true) {
    phantomPath = undefined;
  }

  if (!phantomPath) {
    phantomPath = this.config.get( 'binaries.phantomjs' );

    if (phantomPath) {
      phantomPath = path.resolve(phantomPath.src, phantomPath.value);
    }
  }

  logger.verbose(i18n('Creating phantomjs UACs'));

  if (phantomPath) {
    logger.verbose(i18n('Using phantomjs binary at %s', phantomPath));
  }

  tests.forEach(function (test) {
    new Uac()
      .init(test.url.run, phantomPath)
      .runTest();
  });

  // if (!test.annotations['venus-type'] || test.annotations['venus-type'] !== 'casperjs') {
};

// Create a new instance of Uac
function create(url, binary) {
  var instance = new Uac();
  instance.init(url, binary);
  return instance;
}

module.exports.onTestsLoaded = new Manager().onTestsLoaded;
module.exports.Uac = Uac;
module.exports.create = create;
Object.seal(module.exports);
