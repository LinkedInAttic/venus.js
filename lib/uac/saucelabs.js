/**
 * @author LinkedIn
 */
var webdriver   = require('wd'),
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n'),
    path        = require('path');

/**
 * Controls a webdriver script
 */
function SauceLabsUac() {}

/**
 * Initialize
 */
SauceLabsUac.prototype.init = function(url, options) {
  this.url = url;
  this.client = webdriver.remote( 
    "ondemand.saucelabs.com",
    80,
    options.desiredCapabilities.username,
    options.desiredCapabilities.accessKey
  );

  this.desiredCapabilities = {
    browserName: options.desiredCapabilities.browserName,
    version: options.desiredCapabilities.version,
    platform: options.desiredCapabilities.platform,
    username: options.desiredCapabilities.username,
    accessKey: options.desiredCapabilities.accessKey
  };
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

  browser.init(this.desiredCapabilities, function() {
    browser.get(loadUrl, function() {
      browser.quit();
    });
  });

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
