/**
 * @venus-library mocha
 * @venus-code ../src/Greeter.js
 */

describe('Greeter', function() {

  it('.talk() should <b>format</b> string', function() {
    var greet  = new Greeter(),
        result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

    expect(result).to.be('Hello Seth, how are you doing this fine Thursday?');
  });

});
