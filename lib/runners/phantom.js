/**
 * @author LinkedIn
 */
var phantomSync = require('phantom-sync'),
    Phantom     = phantomSync.Phantom,
    Sync        = phantomSync.Sync,
    logger      = require('../util/logger'),
    i18n        = require('../util/i18n');

/**
 * Controls a phantomJS instance to run tests
 */
function PhantomRunner() {}

/**
 * Initialize
 */
PhantomRunner.prototype.init = function(url) {
  this.browser = new Phantom();
  this.url = url;
};

/**
 * Run a test
 * @param {Function} cb callback for when test has finished
 * @param {String} url test url
 */
PhantomRunner.prototype.runTest = function(cb, url) {
  var browser = this.browser,
      loadUrl = url || this.url,
      done;

  if(typeof cb === 'function') {
    done = cb;
  } else {
    done = function() {};
  }

  logger.info( i18n('Phantom browser is loading %s', loadUrl) );

  Sync(function() {
    var page,
        instance,
        status,
        title;

    instance = browser.create();
    page     = instance.createPage();
    status   = page.open(loadUrl);
    title    = page.evaluate(function() {
      return document.title;
    });

    done({
      title: title,
      status: status
    });

    setTimeout(instance.exit, 1000);
  });
};

/**
 * Create a new instance of PhantomRunner
 */
function create(url) {
  var instance = new PhantomRunner();
  instance.init(url);
  return instance;
}

module.exports.PhantomRunner = PhantomRunner;
module.exports.create = create;
Object.seal(module.exports);
