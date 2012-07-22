/**
 *  @venus-library    mocha
 *  @venus-template   default
 *  @venus-include    parse_comments.js
 *  @venus-include    foo.js
 */

var javascript = true;

describe('first test', function() {
  it('should work', function() {
    expect('foo').to.be('foo');
  });
});
