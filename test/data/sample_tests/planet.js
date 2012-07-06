/**
 *  @venus-framework mocha
 *  @venus-template default
 *  @venus-include /home/smclaugh/.bash_profile
 *  @venus-include /home/smclaugh/.bash_aliases
 */

var javascript = true;

describe('first test', function() {
  it('should work', function() {
    '1'.should.eql('1');
  });
});
