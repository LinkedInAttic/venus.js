/**
 * @venus-library mocha
 */

function foo(a, b) {
  return a + b;
}

describe('foo', function() {
  it('should add two numbers', function() {
    var x = foo(1, 2);
    expect(x).to.be(3);
  });
});
