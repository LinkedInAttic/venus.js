/**
 * @venus-library mocha
 * @venus-code ./Greeter.js
 */

describe('Greeter', function() {

  it('.talk() should <b>format string</b>', function() {
    var greet  = new Greeter(),
        result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

    expect(result).to.be('Hello Seth, how are you doing this fine Thursday?');
  });

});
