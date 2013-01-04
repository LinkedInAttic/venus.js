/**
 * @author LinkedIn
 */
var should        = require('../../lib/sinon-chai').chai.should(),
    PhantomRunner = require('../../../lib/uac/phantom'),
    http          = require('http');

describe('lib/uac/phantom', function() {
  it('should load a webpage', function(done) {
    var browser = PhantomRunner.create(), server, port;

    server = http.createServer( function( req, res ){
      res.end('');
      browser.shutdown();
      done();
    });

    server.listen();
    port = server.address().port;

    browser.runTest( 'http://localhost:' + port );
  });

  describe( 'custom binary paths', function(){
    it( 'it should work with a custom path', function(){
      var browser = PhantomRunner.create( null, 'echo' );
      browser.binary.should.eql( 'echo' );
    });
  });
});
