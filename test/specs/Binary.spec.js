/**
 * @author LinkedIn
 */
var should    = require('../lib/sinon-chai').chai.should(),
    sinon     = require('sinon'),
    spawn     = require('child_process').spawn,
    path      = require('path');

describe('Venus binary', function() {
  var process, binaryPath;

  binaryPath = path.resolve(__dirname, '..', '..', 'bin', 'venus');

  it('should return exit code 1 when a test fails', function () {
    process = spawn(binaryPath);

    process.on('exit', function (code) {
      console.log('exit code', code);
    });
  });
});
