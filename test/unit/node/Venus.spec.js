/**
 * @author LinkedIn
 */
var expect    = require('expect.js'),
    sinon     = require('sinon'),
    Venus     = require('../../../Venus'),
    constants = require('../../../lib/constants'),
    logger    = require('../../../lib/util/logger'),
    helpers   = require('../../lib/helpers');

describe('Venus main', function() {
  it('should instantiate', function() {
    var venus = new Venus();
    expect(venus).to.be.ok();
    expect(venus).to.be.a(Venus);
  });

  it('should call run when run command is passed', function() {
    var argv = ['node', 'venus', 'run'],
        app  = new Venus();

    app.run = sinon.spy();
    app.start(argv);
    expect(app.run.calledOnce).to.be(true);
  });

  it('should initialize a new project when init command is passed', function() {
    var argv = ['node', 'venus', 'init'],
        app  = new Venus();

    app.initProjectDirectory = sinon.spy();
    app.start(argv);
    expect(app.initProjectDirectory.calledOnce).to.be(true);
  });

  describe('parse args in default mode', function () {
    var argv, app;

    beforeEach(function () {
      app = new Venus();
      argv = ['node', 'venus'];
    });

    it('should parse tests in default mode when comma delimited', function (done) {
      argv.push('a.js,b.js,c.js');

      app.run = function (program) {
        expect(program.test).to.eql('a.js,b.js,c.js');
        done();
      };

      app.start(argv);
    });

    it('should parse tests in default mode when space separated', function (done) {
      argv.push('a.js');
      argv.push('b.js');
      argv.push('c.js');
      argv.push('-e');
      argv.push('ghost');

      app.run = function (program) {
        expect(program.test).to.eql('a.js,b.js,c.js');
        expect(program.environment).to.eql('ghost');

        done();
      };

      app.start(argv);
    });

    it('should operate on current directory when no tests are specified', function (done) {
      argv.push('-e');

      app.run = function (program) {
        expect(program.test).to.eql('.');
        done();
      };

      app.start(argv);
    });
  });

  describe('cleaning temporary direction', function() {
    var dirOps,
        sandbox,
        app,
        dir = constants.baseTempDir;

    beforeEach(function(done) {
      app = new Venus();
      sandbox = sinon.sandbox.create();
      sandbox.stub(logger, 'info');
      sandbox.stub(logger, 'warn');

      dirOps = helpers.dirOps(dir);
      dirOps.remove()
        .then(function() {
          done();
        });
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should send a clean command', function() {
      var argv = ['node', 'venus', 'clean'];
      sandbox.spy(app, 'clean');
      app.start(argv);
      sinon.assert.calledOnce(app.clean);
    });

    it('should remove the top level temp directory when being called', function(done) {
      dirOps.make()
        .then(app.clean)
        .done(function(tempDir) {
          expect(tempDir).to.be(dir);
          done();
        })
    });

    it('should attempt to remove a directory when it does not exist', function(done) {
      dirOps.remove()
        .then(app.clean)
        .then(function() {}, function(e) {
          expect(e).to.be.an(Error);
          done();
        });
    });
  });
});
