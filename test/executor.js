/**
 * @author LinkedIn
 */
var sinonChai = require('./lib/sinon-chai'),
    sinon     = require('sinon'),
    executor  = require('../lib/executor'),
    io        = require('socket.io');

describe('lib/executor', function() {
  it('should connect to socket-io server on instantiation', function(done) {
    var fakeMasterServer = io.listen(3333);
    fakeMasterServer.disable('log');

    fakeMasterServer.on('connection', function(socket) {
      done();
    });

    new executor.Executor({ masterUrl: 'http://localhost:3333' });
  });
});
