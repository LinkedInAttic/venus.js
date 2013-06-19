/**
 * @author LinkedIn
 */
var expect    = require('expect.js'),
    sinon     = require('sinon'),
    Venus     = require('../../Venus');

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
});
