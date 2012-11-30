// @author LinkedIn   

// The Venus application code that is called by the Venus shell script (bin/venus)  
  
var colors    = require('colors'),
    json5     = require('json5/lib/require'),
    _         = require('underscore'),
    Config    = require('./lib/config'),
    overlord  = require('./lib/overlord'),
    executor  = require('./lib/executor'),
    i18n      = require('./lib/util/i18n'),
    locale    = require('./lib/util/locale'),
    logger    = require('./lib/util/logger'),
    program   = require('commander'),
    hostname  = require('os').hostname(),
    prompt    = require('cli-prompt'),
    wrench    = require('wrench'),
    fs        = require('fs'),
    path      = require('path');

// The Venus application object  
function Venus() {};

// Start the application  
Venus.prototype.run = function(args) {
  this.commandLineArguments = args;
  this.init(args);
};

// Stop the application  
Venus.prototype.shutdown = function() {
  throw new Error('Not implemented');
};

// Initialize the application  
Venus.prototype.init = function (args) {

  // Define command line options  
  program
    .version('0.0.1')

  // init command  
  program
    .command('init')
    .description( i18n('initialize new venus project directory') )
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .action( _.bind(this.initProjectDirectory, this) );

  // run command  
  program
    .command('run')
    .description( i18n('Run tests') )
    .option('-t, --test [tests]', i18n('Comma separated string of tests to run'))
    .option('-p, --port [port]', i18n('port to run on'), function(value) { return parseInt(value, 10); })
    .option('-o, --overlord [url]', i18n('connect to an overlord server'))
    .option('-n, --phantom', i18n('Use phantomJS client to run browser tests'))
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .action( _.bind(this.startExecutor, this) );

  // listen command  
  // TODO: Re-enable once overlord code is implemented  
  //program  
    //.command('listen')  
    //.description( i18n('Start the Overlord') )  
    //.option('-p, --port [port]', i18n('port to run on'), function(value) { return parseInt(value, 10); })  
    //.option('-l, --locale [locale]', i18n('Specify locale to use'))  
    //.option('-v, --verbose', i18n('Run in verbose mode'))  
    //.option('-d, --debug', i18n('Run in debug mode'))  
    //.action( _.bind(this.startOverlord, this) );  

  program.parse(args);
};

// Apply common command line flags  
Venus.prototype.applyCommandLineFlags = function(program) {
  // Check if debug logging should be enabled
  if(program.debug) {
    logger.transports.console.level = 'debug';
  }

  // Set locale
  if(program.locale) {
    locale(program.locale);
  }
};

// Start in overlord mode - server which allows browsers to be captured  
Venus.prototype.startOverlord = function(program) {
  this.applyCommandLineFlags(program);
  logger.verbose( i18n('Starting Overlord') );
  program.homeFolder = __dirname;
  this.server = overlord.start(program);
};

// Start in Executor mode - run tests  
Venus.prototype.startExecutor = function(program) {
  logger.verbose( i18n('Starting in executor mode') );

  this.applyCommandLineFlags(program);
  program.homeFolder = __dirname;

  if(program.overlord === 1) {
    program.overlord = overlord.defaultUrl;
  }

  this.server = executor.start(program);
};

// Initialize new project directory  
Venus.prototype.initProjectDirectory = function(program) {
  var venusConfigFolderName = '.venus';

  logger.verbose( i18n('Initializing new Venus project') );
  this.applyCommandLineFlags(program);
  program.homeFolder = __dirname;

  if(fs.existsSync(venusConfigFolderName)) {
    prompt( i18n('Warning'.red + ': ' + venusConfigFolderName + ' exists. Overwrite? (y/n) '), function(input) {
      if(input.toUpperCase() === 'Y') {
        createDir();
      } else {
        process.exit(1);
      }
    });
  } else {
    createDir();
  }

  function createDir() {
    // copy global directory  
    wrench.copyDirSyncRecursive( path.resolve(__dirname, venusConfigFolderName), venusConfigFolderName );
    console.log( i18n('New Venus project created in ' + process.cwd()) );
    process.exit(1);
  }
};

module.exports = Venus;
Object.seal(module.exports);