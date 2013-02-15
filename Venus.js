// @author LinkedIn

/**
 * The Venus application code that is called by the Venus shell script (bin/venus).
 * @file
 */
  
var _         = require('underscore'),
    executor  = require('./lib/executor'),
    i18n      = require('./lib/util/i18n'),
    locale    = require('./lib/util/locale'),
    logger    = require('./lib/util/logger'),
    program   = require('commander'),
    prompt    = require('cli-prompt'),
    wrench    = require('wrench'),
    fs        = require('fs'),
    path      = require('path');

/**
 * The Venus application object
 * @constructor
 */
function Venus() {}

/**
 * Starts the application
 * @param {Object[]} args Command line arguments.  See {@link http://nodejs.org/api/process.html#process_process_argv}
 *   for the order of arguments.
 * @method Venus#run
 */
Venus.prototype.run = function (args) {
  this.noCommand = true;
  this.commandLineArguments = args;
  this.init(args);
};


/**
 * Stops the application
 * @method Venus#shutdown
 */
Venus.prototype.shutdown = function () {
  throw new Error('Not implemented');
};

// Initialize the application
/**
 * Initializes the application
 * @param {Object[]} args Command line arguments.  See {@link http://nodejs.org/api/process.html#process_process_argv}
 *   for the order of arguments.
 * @method Venus#init
 */
Venus.prototype.init = function (args) {

  // Define command line options
  program
    .version(require('./package').version);

  // init command
  program
    .command('init')
    .description(i18n('initialize new venus project directory'))
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .action(_.bind(this.command(this.initProjectDirectory), this));

  // demo mode command
  program
    .command('demo')
    .description(i18n('run an example venus test'))
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .action(_.bind(this.command(this.runDemo), this));

  // run command
  program
    .command('run')
    .description(i18n('Run tests'))
    .option('-t, --test [tests]', i18n('Comma separated string of tests to run'))
    .option('-p, --port [port]', i18n('port to run on'), function (value) { return parseInt(value, 10); })
    .option('-n, --phantom [path to binary]', i18n('Use phantomJS client to run browser tests'))
    .option('-s, --selenium', i18n('Use selenium client to run browser tests'))
    .option('-r, --selenium-server [url]', i18n('Specify selenium server to use'))
    .option('-b, --selenium-browser [browser]', i18n('Specify browser to use with selenium'))
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .option('-c, --coverage', i18n('Generate Code Coverage Report'))
    .option('--require-annotations', i18n('Ignore JavaScript test files which do not contain a Venus annotation (@venus-*)'))
    .action(_.bind(this.command(this.startExecutor), this));

  program.parse(args);

  if (this.noCommand) {
    program.outputHelp();
  }
};

/**
 * Marks function as a Venus command, by setting its execution context to the
 * Venus instance.
 * @param {Function} fn The function to wrap
 * @method Venus#command
 */
Venus.prototype.command = function (fn) {
  return function () {
    this.noCommand = false;
    fn.apply(this, arguments);
  }.bind(this);
};

/**
 * Applies logging and L10N options based on options passed in.
 * @param {Object} program Options to set
 * @param {Boolean} [program.debug] Specify true to enable debug-level messages.
 * @param {String} [program.locale] ISO2 code of the desired language to support.
 * @method Venus#applyCommandLineFlags
 */
Venus.prototype.applyCommandLineFlags = function (program) {
  // Check if debug logging should be enabled
  if (program.debug) {
    logger.transports.console.level = 'debug';
  }

  // Set locale
  if (program.locale) {
    locale(program.locale);
  }
};

/**
 * Starts the Venus server (runs/serves tests), with specified options.
 * @param {Object} program Options to set.
 * @param {Boolean} [program.debug] Specify true to enable debug-level messages.
 * @param {String} [program.locale] ISO2 code of the desired language to support.
 * @method Venus#startExecutor
 */
Venus.prototype.startExecutor = function (program) {
  logger.verbose(i18n('Starting in executor mode'));

  this.applyCommandLineFlags(program);
  program.homeFolder = __dirname;

  this.server = executor.start(program);
};

/**
 * Runs Venus in demo mode, with hard-coded tests.
 * @param {Object} program Options to set.
 * @param {Boolean} [program.debug] Specify true to enable debug-level messages.
 * @param {String} [program.locale] ISO2 code of the desired language to support.
 * @method Venus#runDemo
 */
Venus.prototype.runDemo = function (program) {
  var testFile = path.resolve(__dirname, 'examples', '06-SimpleCoverageTest', 'specs', 'Greeter.spec.js');

  logger.verbose(i18n('Running demo'));

  program.test = testFile;
  program.phantom = true;
  program.coverage = true;
  this.startExecutor(program);
};

/**
 * Initializes the directory from which to serve test cases and resources.
 * @param {Object} program Options to set.
 * @param {Boolean} [program.debug] Specify true to enable debug-level messages.
 * @param {String} [program.locale] ISO2 code of the desired language to support.
 * @method Venus#initProjectDirectory
 */
Venus.prototype.initProjectDirectory = function (program) {
  var venusConfigFolderName = '.venus';

  logger.verbose(i18n('Initializing new Venus project'));
  this.applyCommandLineFlags(program);
  program.homeFolder = __dirname;

  function createDir() {
    // copy global directory
    wrench.copyDirSyncRecursive(path.resolve(__dirname, venusConfigFolderName, '.init-data'), venusConfigFolderName);
    console.log(i18n('New Venus project created in ' + process.cwd()));
    return;
  }

  if (fs.existsSync(venusConfigFolderName)) {
    prompt(i18n('Warning'.red + ': ' + venusConfigFolderName + ' exists. Overwrite? (y/n) '), function (input) {
      if (input.toUpperCase() === 'Y') {
        createDir();
      } else {
        return;
      }
    });
  } else {
    createDir();
  }

};

module.exports = Venus;
Object.seal(module.exports);
