/**
 * @venus-library mocha
 */
describe('sample test', function () {
  var spy = sinon.spy();

  it('should only run once', function () {
    spy();
    expect(spy.callCount).to.be(1);
  });

  it('should only run twice', function () {
    spy();
    expect(spy.callCount).to.be(2);
  });
});
