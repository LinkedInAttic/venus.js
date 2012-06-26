/**
 * @author LinkedIn
 */
var sinonChai = require('./lib/sinon-chai');
var should    = require('chai').should();
var sinon     = require('sinon');
var executor  = require('../lib/executor');
var io        = require('socket.io');
var hostname  = require('os').hostname();

describe('lib/executor', function() {
  it('should connect to socket-io server on instantiation', function(done) {
    var fakeMasterServer = io.listen(3333);
    fakeMasterServer.disable('log');

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
