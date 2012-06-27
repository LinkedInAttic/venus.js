/**
 * Parses a testcase (or spec)
 * @author LinkedIn
 */
'use strict';
var fs = require('fs');

function parseTestFile( file, cb ) {
  var result = {
    path: file
  };

  fs.readFile(file, function( err, data ) {
    if(err) {
      result.error = err;
      return;
    }

    result.data = data.toString();
    cb(result);
  });
}

module.exports.parseTestFile = parseTestFile;
Object.seal(module.exports);
