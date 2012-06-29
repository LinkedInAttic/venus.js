/**
 * @author LinkedIn
 */
var should    = require('./lib/sinon-chai').chai.should(),
    sinon     = require('sinon'),
    Venus     = require('../Venus');

describe('Venus main', function() {
  it('should call initialize project directory when correct command line arg is present', function() {
    var argv = ['node', 'venus', 'init'],
        app  = new Venus();

    sinon.spy(app, 'initProjectDirectory');
    app.run(argv);
    app.initProjectDirectory.should.have.been.calledOnce;
  });

  it('should start overlord when no command line args are present', function() {
    var argv = ['node', 'venus'],
        app  = new Venus();

    sinon.spy(app, 'startOverlord');
    app.run(argv);
    app.startOverlord.should.have.been.calledOnce;
  });

  it('should start executor when --test flag is present', function() {
    var argv = ['node', 'venus', '--test'],
        app  = new Venus();

    sinon.spy(app, 'startExecutor');
    app.run(argv);
    app.startExecutor.should.have.been.calledOnce;
    app.shutdown();
  });
});
