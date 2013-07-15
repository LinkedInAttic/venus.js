/**
 * @venus-library mocha
 * @venus-include ../Greeter.js
 */

describe('Greeter', function() {

  it('.bye() should say goodbye', function(done) {

    require(['Greeter'], function (Greeter) {
      var greet  = new Greeter(),
          result = greet.bye(true);

      expect(result).to.be('goodbye...');
      done();
    });

  });

});
