/**
 * @venus-code runnerClient/VenusClientLibrary.js
 */
describe('VenusClientLibrary', function() {
  it('should expect on the window as VenusClientLibrary', function() {
    expect(window.VenusClientLibrary).to.be.ok();
  });

  it('should instantiate a new VenusClientLibrary object', function() {
    var venusClientLibrary = new VenusClientLibrary({
      host: 'www.example.com',
      port: 1234
    });

    expect(venusClientLibrary).to.be.a(VenusClientLibrary);
  });
});
