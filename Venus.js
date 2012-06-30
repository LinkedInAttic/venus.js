/**
 * @author LinkedIn
 */
var colors    = require('colors'),
    overlord  = require('./lib/overlord'),
    executor  = require('./lib/executor'),
    i18n      = require('./lib/i18n'),
    locale    = require('./lib/locale'),
    cli       = require('./lib/cli'),
    _         = require('underscore'),
    logger    = require('./lib/logger'),
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
  this.commandLineArguments = args;
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

  config.homeFolder = __dirname;

  // Set locale
  if(config.locale) {
    locale(config.locale);
  }

  // Execute provided command
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
  logger.info( i18n('Starting Overlord') );
  this.server = overlord.start(config);
};

/**
 * Start in Executor mode - run tests
 */
Venus.prototype.startExecutor = function(config) {
  logger.info( i18n('Starting in executor mode') );
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
Venus.prototype.printUsage = function(config) {
  var bin = _.last(this.commandLineArguments[1].split('/'));
  console.log( i18n('usage: %s %s %s', bin, '[COMMAND]', '[FLAGS]') );
  console.log( '\n\t', 'init'.yellow );
  console.log( '\t\t', i18n('Create new .venus project directory') );

  console.log( '\n\t', 'listen'.yellow);
  console.log( '\t\t', i18n('Starts the overlord') );

  console.log( '\n\t', 'exec'.yellow);
  console.log( '\t\t', i18n('Executes a test') );
};

module.exports = Venus;
