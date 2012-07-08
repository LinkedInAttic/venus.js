/**
 * @venus-library mocha
 */

function foo(a, b) {
  return a + b - 1;
}

describe('foo', function() {
  it('should add two numbers', function() {
    var x = foo(1, 2);
    x.should.eql(3);
  });
});
