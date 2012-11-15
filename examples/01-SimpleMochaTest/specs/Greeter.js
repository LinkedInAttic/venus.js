/**
 * @venus-library mocha
 * @venus-include ../Greeter.js
 */

describe('Greeter', function() {

  it('should say hello Seth', function() {
    var greet = new Greeter();

    expect(
      greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday')
    ).to.be('Hello Seth, how are you doing this fine Thursday?');
  });

});
