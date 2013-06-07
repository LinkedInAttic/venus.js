/**
 * @author LinkedIn
 */
var should     = require('../lib/sinon-chai').chai.should(),
    testrun   = require('../../lib/testrun');

describe('lib/testrun', function() {

  it('should return the number of tests contained in the run', function() {
    var run;

    run = testrun.create({ a: 1, b: 2 });
    run.testCount.should.eql(2);

    run = testrun.create({});
    run.testCount.should.eql(0);

    run = testrun.create({ a: 1 });
    run.testCount.should.eql(1);

    run = testrun.create();
    run.testCount.should.eql(0);
  });

  it('should return tests as an array', function() {
    var run;

    run = testrun.create({ a: 1, b: 2 });
    run.testArray.should.eql([1, 2]);
  });

  it('should return array of test urls', function() {
    var run;

    run = testrun.create({
      a: { url: { run: 'http://localhost/1' } },
      b: { url: { run: 'http://localhost/2' } },
      c: { url: { run: 'http://localhost/3' } }
    });

    run.urls.should.eql([
      { run: 'http://localhost/1' },
      { run: 'http://localhost/2' },
      { run: 'http://localhost/3' }]);
  });

});
