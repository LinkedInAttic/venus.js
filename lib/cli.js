var nopt = require('nopt');

/**
 * Parse command line arguments
 * @param {Array} args the command line arguments
 */
exports.parseCommandLineArgs = function( args ) {
  var options = {
        'port':   Number
      },
      shorthand = {
        'p':  '--port'
      };

  return nopt(options, shorthand, args);
}

