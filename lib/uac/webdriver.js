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
function Uac() {}

/**
 * Initialize
 */
Uac.prototype.init = function(url, options) {
  this.url = url;
  this.client = webdriver.remote( {
    host: options.host,
    desiredCapabilities: {
      browserName: options.desiredCapabilities.browserName
    }
  });

  return this;
};

/**
 * Run a test
 * @param {Function} cb callback for when test has finished
 * @param {String} url test url
 */
Uac.prototype.runTest = function(cb, url) {
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
  var browserName = options.seleniumBrowser || 'firefox',
      server = options.seleniumServer || 'localhost';

  logger.verbose(i18n('Creating WebDriver UACs'));
  logger.verbose(i18n('Server: ' + server));
  logger.verbose(i18n('Browser: ' + browserName));

  tests.forEach(function (test) {
    new Uac()
      .init(test.url.run, {
           host: server,
           desiredCapabilities: {
            browserName: browserName
           }
      })
      .runTest();
  });
};

/**
 * Create a new instance of Uac
 */
function create(url, options) {
  var instance = new Uac();
  instance.init(url, options);
  return instance;
}

module.exports.Uac = Uac;
module.exports.onTestsLoaded = new Manager().onTestsLoaded;
module.exports.create = create;
Object.seal(module.exports);
