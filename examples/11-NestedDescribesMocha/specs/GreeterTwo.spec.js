/**
 * @venus-library mocha
 * @venus-include ../src/Greeter.js
 */

 /* global Greeter: true */

describe('Greeter 2', function () {
  describe('talk() function 2', function () {
    var greet, result;

    before(function () {
      greet = new Greeter();
    });

    it('.talk() should format string with one variable', function () {
      result = greet.talk('Hello %s!', 'Seth');
      expect(result).to.be('Hello Seth, how are you doing this fine Thursday?');
    });

    it('.talk() should format string with two variables', function () {
      result = greet.talk('Hello %s %s!', 'Seth', 'McLaughlin');
      expect(result).to.be('Hello Seth McLaughlin!');
    });
  });
});

describe('Sibling Greeter 2', function () {

  describe('A 2', function () {
    it('should be under A', function () {
      expect(false).to.be.ok();
    });
  });

  describe('B 2', function () {
    it('should be under B', function () {
      expect(true).to.be.ok();
    });

    it('should be under B too...', function () {
      var result = Greeter.foo();
      expect(result).to.be.ok();
    });

    describe('C2', function () {
      it('should work', function () {
        expect(false).to.be.ok();
      });
    });
  });

});
