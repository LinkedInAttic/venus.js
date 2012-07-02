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
    var fakeOverlordServer = io.listen(3333);
    fakeOverlordServer.set('log level', 0);

    fakeOverlordServer.on('connection', function(socket) {
      done();
    });

    new executor.Executor({ overlordUrl: 'http://localhost:3333' });
  });

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    should.not.exist(executor.foo);
  });

  //it('should have the correct default url', function() {
    //var defaultOverlordUrl = ['http://', hostname, ':', '2012'].join();
    //executor.defaultUrl.should.be(defaultOverlordUrl);
  //});
});
