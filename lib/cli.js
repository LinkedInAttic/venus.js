var nopt = require('nopt');

/**
 * Parse command line arguments
 * @param {Array} args the command line arguments
 */
module.exports.parseCommandLineArgs = function( args ) {
  var options = {
        'port'  :   Number,
        'master': String
      },
      shorthand = {
        'p':  '--port',
        'm':  '--master'
      };

  return nopt(options, shorthand, args);
}

Object.seal(module.exports);
