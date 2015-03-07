/**
 * @author LinkedIn
 */
var expect     = require('expect.js'),
    testrun   = require('../../../lib/testrun');

describe('lib/testrun', function() {

  it('should return the number of tests contained in the run', function() {
    var run;

    run = testrun.create({ a: 1, b: 2 });
    expect(run.testCount).to.be(2);

    run = testrun.create({});
    expect(run.testCount).to.be(0);

    run = testrun.create({ a: 1 });
    expect(run.testCount).to.be(1);

    run = testrun.create();
    expect(run.testCount).to.be(0);
  });

  it('should return tests as an array', function() {
    var run;

    run = testrun.create({ a: 1, b: 2 });
    expect(run.testArray).to.eql([1, 2]);
  });

  it('should return array of test urls', function() {
    var run;

    run = testrun.create({
      a: { url: { run: 'http://localhost/1' } },
      b: { url: { run: 'http://localhost/2' } },
      c: { url: { run: 'http://localhost/3' } }
    });

    expect(run.urls).to.eql([
      { run: 'http://localhost/1' },
      { run: 'http://localhost/2' },
      { run: 'http://localhost/3' }]);
  });

});
