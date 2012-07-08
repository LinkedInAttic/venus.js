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
        var testpath = testHelper.sampleTests('foo.js'),
            conf = testHelper.testConfig(),
            test = new testcase.TestCase(conf),
            testData = test.parseTestFile(testpath).annotations,
            fixture = test.loadFixtureTemplate(testData);

        fixture.should.eql('ship ahoy!\n');
    });
  });

  describe('prepareIncludes', function() {
    it('should load deps', function(done) {
      var testpath = testHelper.sampleTests('prepare_deps.js'),
          conf     = testHelper.testConfig(),
          test     = new testcase.TestCase(conf);

      test.path = testpath;
      test.directory = testHelper.sampleTests();
      test.id = 1;
      test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(testpath).annotations
      ));

      setTimeout(done, 1000);
    });

    it('should work with relative paths', function() {
      var testpath = testHelper.sampleTests('relative_paths.js'),
          conf     = testHelper.testConfig(),
          test     = new testcase.TestCase(conf),
          files;

      test.path = testpath;
      test.directory = testHelper.sampleTests();
      test.id = 1;
      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(testpath).annotations
      ));

      should.exist(files);
      files.should.be.an.instanceOf(Array);
      files[2].url.should.eql('/temp/test/1/includes/test.js');
      files[2].fs.should.contain('/test/data/test.js');

    });
  });

});
