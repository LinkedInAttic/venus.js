/**
 * @author LinkedIn
 */
var executor = require('../../lib/executor'),
    config = require('../../lib/config'),
    should = require('../lib/sinon-chai').chai.should(),
    testHelper = require('../lib/helpers'),
    express = require('express'),
    fs = require('fs'),
    http = require('http'),
    expect = require('expect.js');

describe('lib/executor -- HTTP requests', function() {
  var PORT = 2100,
      conf,
      exec;
  before(function(done) {
    conf = new config.Config(testHelper.fakeCwd());
    exec = new executor.Executor(conf);
    exec.app = express();
    exec.init(
      {
        homeFolder: testHelper.fakeCwd(),
        port: PORT,
        test: './test/data/sample_tests/one.js'
      },
      done);
  });

  describe('static routes', function() {
    it('should return a 200 for an existing route', function(done) {
      // Get a file defined as a path in a static route.  It should return
      // a 200 HTTP status code.  Also assert that the file's contents
      // retrieved via HTTP match that of the actual file opened via fs.
      var staticRouteKey = 'path-to-lorem-ipsum.txt',
          options = {
            hostname: 'localhost',
            method: 'GET',
            path: '/' + staticRouteKey,
            port: PORT
          };
      http.get(
        options,
        function(res) {
          res.setEncoding('utf8');
          var contents = [];
          should.exist(res.statusCode);
          res.statusCode.should.eql(200);
          res.on('data', function(chunk) { contents.push(chunk); });
          res.on('end', function() {
            var actualFilePath = conf.get('routes').value[staticRouteKey],
                actualFile = fs.readFileSync(actualFilePath, 'utf8');
            contents = contents.join('');
            actualFile.should.eql(contents);
            done();
          });
        });
    });

    it('should return a 404 for a non-existing route', function(done) {
      var staticRouteKey = 'non-existing-route.txt',
          options = {
            hostname: 'localhost',
            method: 'GET',
            path: '/' + staticRouteKey,
            port: PORT
          };
      http.get(
        options,
        function(res) {
          should.exist(res.statusCode);
          res.statusCode.should.eql(404);
          done();
        });
    });
  });

  describe('static content', function () {
    it('should return 200 for static content file', function (done) {
      var options = {
            hostname: 'localhost',
            method: 'GET',
            path: '/temp/static/txt/foo.txt',
            port: PORT
          };
      http.get(
        options,
        function(res) {
          res.setEncoding('utf8');
          var contents = [];
          should.exist(res.statusCode);
          expect(res.statusCode).to.be(200);
          res.on('data', function(chunk) { contents.push(chunk); });
          res.on('end', function() {
            contents = contents.join('');
            expect('foo-bar-foo\n').to.be(contents);
            done();
          });
        });
    });
  });
});
