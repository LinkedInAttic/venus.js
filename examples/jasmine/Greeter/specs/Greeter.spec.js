/**
 * @venus-library jasmine
 * @venus-code ../src/Greeter.js
 */

describe('Greeter', function() {

  it('.talk() should format string', function() {
    var greet  = new Greeter(),
        result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

    expect(result).toBe('Hello Seth, how are you doing this fine Thursday?');
  });

});
