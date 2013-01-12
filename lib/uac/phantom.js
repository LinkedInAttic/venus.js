'use strict';

// @author LinkedIn

// Controls a phantomJS instance to run tests
var phantom     = require('phantomjs-please'),
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n'),
    path        = require('path');

// Constructor for PhantomRunner
function PhantomRunner(){};

// Initialize PhantomRunner object
PhantomRunner.prototype.init = function( url, binary ){
  this.url = url;
  this.binary = binary;
  phantom.setup( { phantomBinaryPath: binary } );
  this.browser = phantom.createBrowser();
};

// Run a test using PhantomJS
PhantomRunner.prototype.runTest = function( url ){
  var browser = this.browser,
      loadUrl = url || this.url,
      self    = this,
      done;

  logger.info( i18n('Phantom browser is loading %s', loadUrl) );
  browser.navigate( loadUrl );
};

// Shutdown
PhantomRunner.prototype.shutdown = function() {
  this.browser.kill();
};

// Create a new instance of PhantomRunner
function create(url, binary) {
  var instance = new PhantomRunner();
  instance.init(url, binary);
  return instance;
}

module.exports.PhantomRunner = PhantomRunner;
module.exports.create = create;
Object.seal(module.exports);
