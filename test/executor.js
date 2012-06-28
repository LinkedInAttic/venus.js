/**
 * @author LinkedIn
 */
var should    = require('./lib/sinon-chai').chai.should(),
    sinon     = require('sinon'),
    executor  = require('../lib/executor'),
    io        = require('socket.io'),
    hostname  = require('os').hostname();

describe('lib/executor', function() {
  it('should connect to socket-io server on instantiation', function(done) {
    var fakeMasterServer = io.listen(3333);
    fakeMasterServer.set('log level', 0);

    fakeMasterServer.on('connection', function(socket) {
      done();
    });

    new executor.Executor({ masterUrl: 'http://localhost:3333' });
  });

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    should.not.exist(executor.foo);
  });

  //it('should have the correct default url', function() {
    //var defaultMasterUrl = ['http://', hostname, ':', '2012'].join();
    //executor.defaultUrl.should.be(defaultMasterUrl);
  //});
});
