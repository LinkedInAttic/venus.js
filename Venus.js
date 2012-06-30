/**
 * @author LinkedIn
 */
var colors    = require('colors'),
    overlord   = require('./lib/overlord'),
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
Venus.prototype.init = function (args) {
  var command = args[2],
      config  = cli.parseCommandLineArgs(args);

  this.config = config;
  config.homeFolder = __dirname;

  switch(command) {
    case 'init':
      this.initProjectDirectory();
      break;
    case 'listen':
      this.startOverlord(config);
      break;
    case 'exec':
      this.startExecutor(config);
      break;
    default:
      this.printUsage(config);
      break;
  }
};

/**
 * Start in overlord mode - server which allows browsers to be captured
 */
Venus.prototype.startOverlord = function(config) {
  console.log( i18n('Starting Overlord').yellow );
  this.server = overlord.start(config);
};

/**
 * Start in Executor mode - run tests
 */
Venus.prototype.startExecutor = function(config) {
  console.log( i18n('Starting in executor mode').red );
  config.overlordUrl = config.overlord || overlord.defaultUrl;
  this.server = executor.start(config);
};

/**
 * Initialize new project directory
 */
Venus.prototype.initProjectDirectory = function() {

};

/**
 * Print usage
 */
Venus.prototype.printUsage = function() {
  console.log('usage: ...');
};

module.exports = Venus;
