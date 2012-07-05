/**
 * @author LinkedIn
 */
var should = require('chai').should(),
    cli    = require('../../../lib/util/cli'),
    bin    = 'venus';

describe('lib/cli', function() {
  describe('parseCommandLineArgs', function() {
    var argv = ['node', bin, '--port', '2020'],
        parsed = cli.parseCommandLineArgs(argv);

    it('should accept the --port flag', function() {
      parsed.should.have.property('port');
    });

    it('should parse the --port value', function() {
      parsed.port.should.equal(2020);
    });

  });
});
