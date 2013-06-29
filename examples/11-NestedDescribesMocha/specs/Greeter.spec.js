/**
 * @venus-library mocha
 * @venus-include ../src/Greeter.js
 */

 /* global Greeter: true */

describe('Greeter', function () {
  describe('talk() function', function () {
    var greet, result;

    before(function () {
      greet = new Greeter();
    });

    it('.talk() should format string with one variable', function () {
      result = greet.talk('Hello %s!', 'Seth');
      expect(result).to.be('Hello Seth!');
    });

    it('.talk() should format string with two variables', function () {
      result = greet.talk('Hello %s %s!', 'Seth', 'McLaughlin');
      expect(result).to.be('Hello Seth McLaughlin!');
    });
  });
});
