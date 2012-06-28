/**
 * @author LinkedIn
 */
var colors    = require('colors'),
    master    = require('./lib/master'),
    executor  = require('./lib/executor'),
    i18n      = require('./lib/i18n'),
    cli       = require('./lib/cli'),
    hostname  = require('os').hostname();

/**
 * Application object
 */
function Venus() {}

/**
 * Start the App
 * @params {Array} args the command line arguments
 */
Venus.prototype.run = function(args) {
  this.init(args);
};

/**
 * Stop the app
 */
Venus.prototype.shutdown = function() {
  //this.server.shutdown();
}

/**
 * Initialize application
 * @param {Array} args the command line arguments
 */
Venus.prototype.init = function(args) {
  var config = this.config = cli.parseCommandLineArgs(args);
  config.homeFolder = __dirname;

  if(config.argv.remain.indexOf('init') !== -1) {
    this.initProjectDirectory();
  } else if(config.test) {
    this.startExecutor(config);
  } else {
    this.startMaster(config);
  }
};

/**
 * Start in Master mode - server which allows browsers to be captured
 */
Venus.prototype.startMaster = function(config) {
  console.log( i18n('Starting in master mode').yellow );
  this.server = master.start(config);
};

/**
 * Start in Executor mode - run tests
 */
Venus.prototype.startExecutor = function(config) {
  console.log( i18n('Starting in executor mode').red );
  config.masterUrl = config.master || master.defaultUrl;
  this.server = executor.start(config);
};

/**
 * Initialize new project directory
 */
Venus.prototype.initProjectDirectory = function() {

};

module.exports = Venus;
