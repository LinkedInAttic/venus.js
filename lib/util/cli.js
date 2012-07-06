var commander = require('commander'),
    i18n      = require('./i18n');

/**
 * Parse command line arguments
 * @param {Array} args the command line arguments
 */
module.exports.parseCommandLineArgs = function( args ) {
  commander
    .version('0.0.1')
    .option('-p, --port [port]', i18n('Specify port to run on'))
    .option('-t, --test [tests]', i18n('Comma separated string of tests to run'))
    .option('-d, --debug', i18n('Run in debug mode'))
    .option('-v, --verbose', i18n('Run in verbose mode'))
    .option('-o, --overlord [url]', i18n('When running as executor, specify whether to connect to overlord'))
    .option('-l, --locale [locale]', i18n('Specify locale to use'))
    .option('-n, --phantom', i18n('Use phantomJS client to run browser tests'))
    .parse(args);

  return commander;
}

Object.seal(module.exports);
