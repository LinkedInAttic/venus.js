/**
 * @venus-library mocha
 * @venus-include ../lib/require.js
 * @venus-include ../src/Greeter.js
 */

describe('Greeter', function() {

  require.config({
    baseUrl: '/temp/static/src'
  });

  it('.bye() should say goodbye', function(done) {

    require(['Greeter'], function (Greeter) {
      var greet  = new Greeter(),
          result = greet.bye(true);

      expect(result).to.be('goodbye...');
      done();
    });

  });

});
