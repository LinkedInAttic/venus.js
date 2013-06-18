/**
 * @author LinkedIn
 */
var expect        = require('expect.js'),
    PhantomUac    = require('../../../lib/uac/phantom'),
    http          = require('http');

describe('lib/uac/phantom', function () {
  it('should load a webpage', function (done) {
    var browser = PhantomUac.create(), server, port;

    server = http.createServer( function( req, res ){
      res.end('');
      browser.shutdown();
      done();
    });

    server.listen();
    port = server.address().port;

    browser.runTest( 'http://localhost:' + port );
  });
});
