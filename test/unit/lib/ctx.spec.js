var expect  = require('expect.js'),
    helpers = require('../../helpers'),
    ctx     = helpers.lib('ctx');

describe('ctx', function () {
  var originalCtx, newCtx;

  beforeEach(function () {
    originalCtx = {
      name: function () {
        return 'Venus';
      },
      age: 3
    };

    newCtx = ctx(originalCtx);
  });

  it('should be an exact copy', function () {
    expect(newCtx.name).to.eql(originalCtx.name);
    expect(newCtx.age).to.eql(originalCtx.age);
  });

  it('should support reassignment', function () {
    newCtx.age = 45;

    expect(newCtx.age).to.be(45);
    expect(originalCtx.age).to.be(3);

    newCtx.name = function () {
      return 'New';
    };

    expect(newCtx.name()).to.be('New');
    expect(originalCtx.name()).to.be('Venus');
  });

});
