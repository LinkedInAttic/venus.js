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
function SeleniumUac() {}

/**
 * Initialize
 */
SeleniumUac.prototype.init = function(url, options) {
  this.url = url;
  this.client = webdriver.remote( {
    host: options.host,
    desiredCapabilities: {
      browserName: options.desiredCapabilities.browserName
    }
  });
};

/**
 * Run a test
 * @param {Function} cb callback for when test has finished
 * @param {String} url test url
 */
SeleniumUac.prototype.runTest = function(cb, url) {
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
    .end();

};

/**
 * Create a new instance of SeleniumUac
 */
function create(url, options) {
  var instance = new SeleniumUac();
  instance.init(url, options);
  return instance;
}

module.exports.SeleniumUac = SeleniumUac;
module.exports.create = create;
Object.seal(module.exports);
