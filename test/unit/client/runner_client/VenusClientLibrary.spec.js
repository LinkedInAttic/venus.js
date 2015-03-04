/**
 * @venus-fixture VenusClientLibrary.fixture.html
 * @venus-code runnerClient/VenusClientLibrary.js
 */
describe('VenusClientLibrary', function() {
  function createInstance() {
    return new VenusClientLibrary({
      host: 'www.example.com',
      port: 1234
    });
  }

  it('should expect on the window as VenusClientLibrary', function() {
    expect(window.VenusClientLibrary).to.be.ok();
  });

  it('should instantiate a new VenusClientLibrary object', function() {
    expect(createInstance()).to.be.a(VenusClientLibrary);
  });

  describe('.done()', function() {
    it('should execute VenusTestList.postTestReults from the parent context', sinon.test(function() {
      var instance = createInstance(),
          resultsStub = this.stub(window.parent.VenusTestList, 'postTestResults'),
          results = {
            band: 'Godspeed You! Black Emperor'
          };

      instance.done(results);
      sinon.assert.calledWith(resultsStub, sinon.match(results));
    }));
  });
});
