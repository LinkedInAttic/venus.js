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

  describe('loadHarnessTemplate', function() {
    it('should load test harness template', function() {
        var testpath = testHelper.sampleTests('foo.js'),
            conf = testHelper.testConfig(),
            test = new testcase.TestCase(conf),
            testData = test.parseTestFile(testpath).annotations,
            harness = test.loadHarnessTemplate(testData);

        harness.should.eql('ship ahoy!\n');
    });
  });

  describe('Asserts loading of @venus-fixture values', function() {
    it('should load file-based @venus-fixture contained in testcase directory', function() {
      // Load the file content specified by @venus-fixture in
      // test/data/sample_tests/foo_with_file_fixture_relative.js
      // 'ship ahoy!\n' should be returned.
      var testpath = testHelper.sampleTests('foo_with_file_fixture_relative.js'),
          conf = testHelper.testConfig(),
          test = new testcase.TestCase(conf),
          testData = test.parseTestFile(testpath),
          annotations,
          fixture;

      test.directory = testData.directory;
      test.path = testData.path;
      annotations  = test.resolveAnnotations(testData.annotations),
      fixture = annotations[annotation.VENUS_FIXTURE];

      fixture.should.equal('ship ahoy!\n');
    });
    it('should load file-based @venus-fixture contained in config directory', function() {
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
      files[4].url.should.eql('/temp/test/1/includes/_.test.js');
      files[4].fs.should.contain('/test/data/test.js');

    });

    it('should work with paths containing dashes', function() {
      var testpath = testHelper.sampleTests('paths_with_dashes.js'),
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
      files[4].url.should.eql('/temp/test/1/includes/_.test-file.js');
      files[4].fs.should.contain('/test/data/test-file.js');

    });

    it('should load universal includes', function() {
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
      files[2].url.should.eql('/temp/test/1/lib/file1.js');
      files[3].url.should.eql('/temp/test/1/lib/file2.js');
    });

    it('should load group includes', function() {
      var testpath = testHelper.sampleTests('include_groups.js'),
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
      files[4].url.should.eql('/temp/test/1/lib/file3.js');
    });

    it('should handle different paths with same filename', function() {
      var testpath = testHelper.sampleTests('dupe_filenames.js'),
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
      files[4].url.should.eql('/temp/test/1/includes/fileA.js');
      files[5].url.should.eql('/temp/test/1/includes/_.fileA.js');
      files[6].url.should.eql('/temp/test/1/includes/_.prod.fileA.js');
      //files.should.be.an.instanceOf(Array);
      //files[4].url.should.eql('/temp/test/1/lib/file3.js');
    });

    it('should handle base paths', function () {
      var testpath = testHelper.sampleTests('base_paths.js'),
          conf     = testHelper.testConfig(),
          test     = new testcase.TestCase(conf),
          files,
          resolvedPath,
          match;

      test.path = testpath;
      test.directory = testHelper.sampleTests();
      test.id = 1;
      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(testpath).annotations
      ));

      resolvedPath = files[4].fs;
      match = '/test/data/sample_fs/foo/empty_file.js';
      (resolvedPath.indexOf(match) + match.length).should.eql(resolvedPath.length);

    });
  });
});
