/*
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 **/

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
    path      = require('path'),
    deferred  = require('deferred'),
    ps        = require('./lib/util/ps');

/**
 * The Venus application object
 * @constructor
 */
function Venus() {}

/**
 * Starts the application
 * @param {Object[]} args Command line arguments.  See {@link http://nodejs.org/api/process.html#process_process_argv}
 *   for the order of arguments.
 * @method Venus#start
 */
Venus.prototype.start = function (args) {
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
    .version(require('./package').version)
    .option('-p, --port [port]', i18n('port to run on'), function (value) { return parseInt(value, 10); })
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .option('-c, --coverage', i18n('Generate Code Coverage Report'))
    .option('--hostname [host]', i18n('Set hostname for test URLs, defaults to your ip address'))
    .option('--no-annotations', i18n('Include test files with no Venus annotations (@venus-*)'))
    .option('-e, --environment [env]', i18n('Specify environment to run tests in'))
    .option('-r, --reporter [reporter]', i18n('Test reporter to use. Default is "DefaultReporter"'))
    .option('-o, --output-file [path]', i18n('File to record test results'))
    .option('-n, --phantom', i18n('Run with PhantomJS. This is a shortcut to --environment ghost'))
    .option('--singleton', i18n('Ensures all other Venus processes are killed before starting'));

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
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .option('-c, --coverage', i18n('Generate Code Coverage Report'))
    .option('--hostname [host]', i18n('Set hostname for test URLs, defaults to your ip address'))
    .option('--no-annotations', i18n('Include test files with no Venus annotations (@venus-*)'))
    .option('-e, --environment [env]', i18n('Specify environment to run tests in'))
    .option('-r, --reporter [reporter]', i18n('Test reporter to use. Default is "DefaultReporter"'))
    .option('-o, --output-file [path]', i18n('File to record test results'))
    .option('-n, --phantom', i18n('Run with PhantomJS. This is a shortcut to --environment ghost'))
    .option('--singleton', i18n('Ensures all other Venus processes are killed before starting'))
    .action(_.bind(this.command(this.run), this));

  program.parse(args);

  if (this.noCommand) {
    this.runWithDefaults();
  }
};

/**
 * Try to auto run venus with default settings
 */
Venus.prototype.runWithDefaults = function () {
  var args = this.commandLineArguments,
      encounteredFlag = false,
      possibleTestPaths;

  if (args < 2) {
    return false;
  }

  possibleTestPaths = args.slice(2).filter(function (testPath) {
    if (testPath[0] === '-') {
      encounteredFlag = true;
    }

    return !encounteredFlag;
  });

  logger.verbose(i18n('Running demo'));

  if (possibleTestPaths.length === 0) {
    possibleTestPaths = ['.'];
  }

  program.test =  possibleTestPaths.join(',');
  // program.environment = 'ghost';
  // program.coverage = true;
  this.run(program);

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
 * @method Venus#run
 */
Venus.prototype.run = function (program) {
  logger.verbose(i18n('Starting in executor mode'));

  if (program.hasOwnProperty('phantom')) {
    program.environment = 'ghost';
  }

  this.applyCommandLineFlags(program);

  if (program.hasOwnProperty('singleton')) {
    this.killOtherVenusProcesses().then(proceed);
  } else {
    proceed.call(this);
  }

  function proceed() {
    this.server = new executor.Executor();
    program.homeFolder = __dirname;
    this.server.init(program);
  }
};

/**
 * Kill all other Venus processes besides the current process.
 */
Venus.prototype.killOtherVenusProcesses = function () {
  return ps.grep('venus').then(ps.kill);

};

/**
 * Runs Venus in demo mode, with hard-coded tests.
 * @param {Object} program Options to set.
 * @param {Boolean} [program.debug] Specify true to enable debug-level messages.
 * @param {String} [program.locale] ISO2 code of the desired language to support.
 * @method Venus#runDemo
 */
Venus.prototype.runDemo = function (program) {
  var testFile = path.resolve(__dirname, 'examples', 'mocha', 'Greeter');

  logger.verbose(i18n('Running demo'));

  program.test = testFile;
  program.environment = 'ghost';
  program.coverage = true;
  this.run(program);
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
