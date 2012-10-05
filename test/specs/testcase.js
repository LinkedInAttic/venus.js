/**
 * @author LinkedIn
 */
var should     = require('../lib/sinon-chai').chai.should(),
    testHelper = require('../lib/helpers'),
    testcase   = require('../../lib/testcase'),
    annotation = testcase.annotation,
    config     = require('../../lib/config'),
    hostname   = require('os').hostname();

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

  describe('Asserts loading of @venus-fixture values', function() {
    it('should load file-based @venus-fixture', function() {
      // Load the file content specified by @venus-fixture in
      // test/data/sample_tests/foo_with_file_fixture.js
      // 'ship ahoy!\n' should be returned.
      var testpath = testHelper.sampleTests('foo_with_file_fixture.js'),
          conf = testHelper.testConfig(),
          test = new testcase.TestCase(conf),
          annotations = test.resolveAnnotations(
            test.parseTestFile(testpath).annotations),
          fixture = annotations[annotation.VENUS_FIXTURE];
      fixture.should.equal('ship ahoy!\n');
    });
    it('should load HTML @venus-fixture', function() {
      // Load the string specified by @venus-fixture in
      // test/data/sample_tests/foo_with_html_fixture.js
      // An HTML snippet should be returned.
      var testpath = testHelper.sampleTests('foo_with_html_fixture.js'),
          conf = testHelper.testConfig(),
          test = new testcase.TestCase(conf),
          annotations = test.resolveAnnotations(
            test.parseTestFile(testpath).annotations);
      annotations[annotation.VENUS_FIXTURE].should.equal(
        '<div class="content">Lorem ipsum dolor...</div>');
    });
  });

  describe('prepareIncludes', function() {
    /*
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
    */

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
