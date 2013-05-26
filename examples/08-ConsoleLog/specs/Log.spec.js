/**
 * @venus-library mocha
 */

describe('Log', function() {

  it('should call console.log', function () {
    console.log('my url is', window.location.href);
    expect(true).to.be.ok();
  });

});
