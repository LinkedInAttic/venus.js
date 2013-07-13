/**
 * @venus-library mocha
 * @venus-fixture Fixture.fixture.html
 * @venus-fixture-reset false
 */

describe('Fixture Test', function() {

  it('should change the inner html of an element', function () {
    var el = document.getElementById('test-fixture-1');
    el.innerHTML = 'hello world';
    expect(el.innerHTML).to.be('hello world');
  });

  it('should should have the same inner html', function () {
    var el = document.getElementById('test-fixture-1');
    expect(el.innerHTML).to.be('hello world');
  });
});
