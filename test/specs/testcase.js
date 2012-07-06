/**
 * @author LinkedIn
 */
var should    = require('../lib/sinon-chai').chai.should(),
    testHelper= require('../lib/helpers'),
    testcase  = require('../../lib/testcase'),
    config    = require('../../lib/config'),
    hostname  = require('os').hostname();

describe('lib/testcase', function() {

  describe('loadFixtureTemplate', function() {
    it('should load test fixture template', function() {
        var testpath = testHelper.sampleTestPath(1),
            conf = testHelper.testConfig(),
            test = new testcase.TestCase(conf),
            testData = test.parseTestFile(testpath).metaData,
            fixture = test.loadFixtureTemplate(testData);

        fixture.should.eql('ship ahoy!\n');
    });
  });

  describe('init', function() {
    it('should initialize properly', function() {
      var testpath = testHelper.sampleTestPath(1),
          conf = testHelper.testConfig(),
          test = new testcase.TestCase(conf);

      test.init(testpath, 1, 'http://foo');
      test.fixtureTemplate.should.eql('ship ahoy!\n');
    });
  });

  describe('prepareDependencies', function() {
    it('should load deps', function(done) {
      var testpath = testHelper.sampleTestPath(1),
          conf = testHelper.testConfig(),
          test = new testcase.TestCase(conf);

      test.id = 1;
      test.prepareDependencies(test.parseTestFile(testpath).metaData);

      setTimeout(done, 1000);
    });
  });

});
