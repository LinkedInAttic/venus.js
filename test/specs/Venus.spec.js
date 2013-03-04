/**
 * @author LinkedIn
 */
var should    = require('../lib/sinon-chai').chai.should(),
    sinon     = require('sinon'),
    Venus     = require('../../Venus');

describe('Venus main', function() {
  it('should instantiate', function() {
    var venus = new Venus();
    should.exist(venus);
    (venus instanceof Venus).should.be.true;
  });

  it('should call run when run command is passed', function() {
    var argv = ['node', 'venus', 'run'],
        app  = new Venus();

    app.run = sinon.spy();
    app.start(argv);
    app.run.should.have.been.calledOnce;
  });

  it('should initialize a new project when init command is passed', function() {
    var argv = ['node', 'venus', 'init'],
        app  = new Venus();

    app.initProjectDirectory = sinon.spy();
    app.start(argv);
    app.initProjectDirectory.should.have.been.calledOnce;
  });
});
