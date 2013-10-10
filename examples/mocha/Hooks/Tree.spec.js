/**
 * @venus-library mocha
 * @venus-code ./Tree.js
 * @venus-execute ./setup.js
 * @venus-execute ./setup_async.js
 */

describe('Tree', function() {
  var tree;

  before(function () {
    tree = new Tree(23);
  });


  it('should have the correct id', function () {
    expect(tree.id).to.be(23);
  });

});
