/**
 * @author LinkedIn
 */
var webdriver   = require('webdriverjs'),
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
  this.client = webdriver.remote( {
    host: options.host,
    desiredCapabilities: {
      browserName: options.desiredCapabilities.browserName,
      version: options.desiredCapabilities.version,
      platform: options.desiredCapabilities.platform,
      username: options.desiredCapabilities.username,
      accessKey: options.desiredCapabilities.accessKey
    }
  });
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

  browser
    .init()
    .url( loadUrl )
    .pause( 3000 )
    .quit();

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
