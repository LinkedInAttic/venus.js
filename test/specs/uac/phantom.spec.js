/**
 * @author LinkedIn
 */
var should        = require('../../lib/sinon-chai').chai.should(),
    PhantomRunner = require('../../../lib/uac/phantom'),
    http          = require('http');

describe('lib/uac/phantom', function() {
  it('should load a webpage', function(done) {
    var browser = new PhantomRunner.create(), server, port;

    server = http.createServer( function( req, res ){
      res.end('');
      done();
    });

    server.listen();
    port = server.address().port;
    browser.runTest( 'http://localhost:' + port );
  });
});
