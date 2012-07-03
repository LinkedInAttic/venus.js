/**
 * @author LinkedIn
 */
var should     = require('./lib/sinon-chai').chai.should(),
    sinon      = require('sinon'),
    executor   = require('../lib/executor'),
    io         = require('socket.io'),
    pathHelper = require('../lib/util/pathHelper');
    hostname   = require('os').hostname();

describe('lib/executor', function() {
  it('should connect to socket-io server on init', function(done) {
    var fakeOverlordServer = io.listen(3333);

    fakeOverlordServer.set('log level', 0);

    fakeOverlordServer.on('connection', function(socket) {
      done();
    });

    executor.start({ overlordUrl: 'http://localhost:3333' , homeFolder: pathHelper(__dirname).up().path });
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
