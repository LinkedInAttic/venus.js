/**
 * @author LinkedIn
 */
var expect     = require('expect.js'),
    executor   = require('../../../lib/executor'),
    ioclient   = require('socket.io-client'),
    express    = require('express');

describe('lib/executor -- socket.io', function() {
  var exec, socket;

  before(function(done) {
    exec = new executor.Executor();
    exec.app = express();

    exec.start(2025, function() {
      socket = ioclient.connect('http://localhost', { port: 2025 });
      done();
    });

    exec.testgroup = {
      addCodeCoverageResults: function () {}
    };

  });

  it('should start a socket.io server on the right port', function(done) {
    socket.emit('ping', function(data) {
      expect(data.port).not.to.be(undefined);
      done();
    });
  });

  describe('event "results"', function() {
    it('should handle invalid data', function(done) {
      // invalid result data
      socket.emit('results', {}, function(response) {
        expect(response.status).to.be('error');
        done();
      });
    });

    it('should handle valid data', function(done) {
      // valid result data
      socket.emit('results', { tests: [], done: { failed: 0, passed: 0, runtime: 0 }, userAgent: 'foo browser' }, function(response) {
        expect(response.status).to.be('ok');
        done();
      });
    });
  });

  describe('event "console.log"', function() {
    it('should handle invalid data', function(done) {
      // invalid result data
      socket.emit('console.log', null, function(response) {
        expect(response.status).to.be('error');
        done();
      });
    });

    it('should handle valid data', function(done) {
      // valid result data
      socket.emit('console.log', 'test', function(response) {
        expect(response.status).to.be('ok');
        done();
      });
    });
  });
});
