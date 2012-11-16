/**
 * @venus-library qunit
 * @venus-include ../src/Greeter.js
 */

test('Greeter', function() {
  var greet  = new Greeter(),
      result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

  equal(result, 'Hello Seth, how are you doing this fine Thursday?', 'Greeter.talk() formats the string correctly');
});
