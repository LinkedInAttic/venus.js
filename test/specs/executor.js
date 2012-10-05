/**
 * @author LinkedIn
 */
var should     = require('../lib/sinon-chai').chai.should(),
    sinon      = require('sinon'),
    executor   = require('../../lib/executor'),
    io         = require('socket.io'),
    pathHelper = require('../../lib/util/pathHelper'),
    hostname   = require('os').hostname();

describe('lib/executor', function() {
  // TODO(ryanone, setchmcl): Re-enable this test after Overlord functionality
  // is implemented.
  /*
  it('should connect to socket-io server on init', function(done) {
    var fakeOverlordServer = io.listen(3333),
        config = {
          overlord   : 'http://smclaugh-ld:3333',
          homeFolder : pathHelper(__dirname).up().path,
          test       : 'test/data/sample_tests/foo',
        };

    fakeOverlordServer.set('log level', 0);
    fakeOverlordServer.on('connection', function(socket) {
      done();
    });

    executor.start(config);
  });
  */

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    should.not.exist(executor.foo);
  });

  it('should parse testcases from test string correctly', function() {
    var exec = new executor.Executor(),
        tests = 'test/data/sample_tests/foo,test/data/sample_tests/bar',
        result;
    result = exec.parseTests(tests);
    should.exist(result);
    Object.keys(result).length.should.eql(3);
  });

  it('should handle parsing testcases from undefined test string', function() {
    var exec = new executor.Executor(),
        tests,
        result;

    result = exec.parseTests(tests);
    should.exist(result);
    Object.keys(result).length.should.eql(0);
  });

  it('should handle tests being specified with a .js file extension', function() {
    var exec   = new executor.Executor(),
        tests  = 'test/data/sample_tests/foo.js',
        result = exec.parseTests(tests);

    Object.keys(result).length.should.eql(1);
  });

  it('should parse comments in test cases', function() {
    var exec   = new executor.Executor(),
        tests  = 'test/data/sample_tests/parse_comments',
        result = exec.parseTests(tests),
        first;

    first = Object.keys(result)[0];

    should.exist(result);
    should.exist(result[first]);
    result[first].annotations['venus-library'].should.eql('mocha');
    result[first].annotations['venus-include'].should.have.length(2);
  });

  // TODO(ryanone, setchmcl): Re-enable this test after Overlord functionality
  // is implemented.
  /*
  it('should only connect to overlord if correct flag is set', function() {
    var exec   = new executor.Executor(),
        config = { overlord: 'http://localhost', test: 'test/data/sample_tests/foo' },
        spy    = sinon.spy(exec, 'connectOverlord');

    exec.init(config);
    spy.callCount.should.eql(1);
  });
  */

  it('should create phantom clients if correct flag is set', function() {
    var exec   = new executor.Executor(),
        config = { phantom: true, test: 'test/data/sample_tests/foo' },
        spy    = sinon.spy(exec, 'createPhantomRunners');

    exec.init(config);
    spy.callCount.should.eql(1);
  });
});
