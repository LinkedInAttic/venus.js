/**
 * @author LinkedIn
 */
var expect    = require('expect.js'),
    sinon     = require('sinon'),
    Venus     = require('../../../Venus');

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
});
