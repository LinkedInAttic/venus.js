/**
 * @venus-library mocha
 * @venus-code code.js
 */

describe('testThing', function() {
  describe('.add()', function() {
    it('should add numbers', function() {
      expect(testThing.add(1, 1)).to.be(2);
    });
  });

  describe('.multiply()', function() {
    it('should multiply numbers', function() {
      expect(testThing.multiply(2, 2)).to.be(4);
    });
  });

  describe('.subtract()', function() {
    it('should do subtraction', function() {
      expect(testThing.subtract(5, 3)).to.be(2);
    });
  });
});
