/**
 * @venus-library mocha
 * @venus-include ../src/Greeter.js
 */

describe('Greeter', function() {

  it('.bye() should say goodbye', function() {
    var greet  = new Greeter(),
        result = greet.bye(true);

    expect(result).to.be('goodbye...');
  });

});
