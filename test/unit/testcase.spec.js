/**
 * @author LinkedIn
 */
var testHelper = require('../lib/helpers'),
    testcase   = require('../../lib/testcase'),
    annotation = testcase.annotation,
    path       = require('path'),
    expect     = require('expect.js');

describe('lib/testcase', function () {
  var test, files, testData;

  beforeEach(function () {
    test = new testcase.TestCase();
    test.config = testHelper.testConfig();
    test.directory = testHelper.sampleTests();
    test.id = 1;
  });


  describe('loadHarnessTemplate', function() {
    var harness;

    it('should load test harness template', function() {
      test.path = testHelper.sampleTests('foo.js'),
      testData = test.parseTestFile(test.path).annotations,
      harness = test.loadHarnessTemplate(testData);

      expect(harness).to.be('ship ahoy!\n');
    });
  });

  describe('Asserts loading of @venus-fixture values', function() {
    var annotations, fixture;

    it('should load file-based @venus-fixture contained in testcase directory', function() {
      // Load the file content specified by @venus-fixture in
      // test/data/sample_tests/foo_with_file_fixture_relative.js
      // 'ship ahoy!\n' should be returned.
      test.path = testHelper.sampleTests('foo_with_file_fixture_relative.js'),
      testData  = test.parseTestFile(test.path);
      annotations  = test.resolveAnnotations(testData.annotations),
      fixture = annotations[annotation.VENUS_FIXTURE];

      expect(fixture).to.be('ship ahoy!\n');
    });
    it('should load file-based @venus-fixture contained in config directory', function() {
      // Load the file content specified by @venus-fixture in
      // test/data/sample_tests/foo_with_file_fixture.js
      // 'ship ahoy!\n' should be returned.
      test.path = testHelper.sampleTests('foo_with_file_fixture.js'),
      testData  = test.parseTestFile(test.path);
      annotations = test.resolveAnnotations(testData.annotations);
      fixture = annotations[annotation.VENUS_FIXTURE];

      expect(fixture).to.be('ship ahoy!\n');
    });

    it('should load HTML @venus-fixture', function() {
      // Load the string specified by @venus-fixture in
      // test/data/sample_tests/foo_with_html_fixture.js
      // An HTML snippet should be returned.
      test.path = testHelper.sampleTests('foo_with_html_fixture.js'),
      testData  = test.parseTestFile(test.path);
      annotations = test.resolveAnnotations(testData.annotations);
      fixture = annotations[annotation.VENUS_FIXTURE];

      expect(fixture).to.be('<div class="content">Lorem ipsum dolor...</div>');
    });
  });

  describe('prepareIncludes', function() {

    it('should work with relative paths', function() {
      test.path = testHelper.sampleTests('relative_paths.js'),

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      expect(files).to.be.ok();
      expect(files).to.be.an('array');
      expect(files[4].url).to.be('/temp/test/1/includes/_.test.js');
      expect(files[4].fs).to.contain('/test/data/test.js');
      expect(files[6].fs).to.contain('/test/data/sample_tests/bar.js');
      expect(files[6].url).to.contain('/bar.js');

    });

    it('should work with paths containing dashes', function() {
      test.path = testHelper.sampleTests('paths_with_dashes.js'),

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      expect(files).to.be.ok();
      expect(files).to.be.an('array');
      expect(files[4].url).to.be('/temp/test/1/includes/_.test-file.js');
      expect(files[4].fs).to.contain('/test/data/test-file.js');
    });

    it('should load universal includes', function() {
      test.path = testHelper.sampleTests('relative_paths.js'),

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      expect(files).to.be.ok();
      expect(files).to.be.an('array');
      expect(files[2].url).to.be('/temp/test/1/lib/file1.js');
      expect(files[3].url).to.be('/temp/test/1/lib/file2.js');
    });

    it('should load group includes', function() {
      test.path = testHelper.sampleTests('include_groups.js');

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      expect(files).to.be.ok();
      expect(files).to.be.an('array');
      expect(files[4].url).to.be('/temp/test/1/lib/file3.js');
    });

    it('should handle different paths with same filename', function() {
      test.path = testHelper.sampleTests('dupe_filenames.js');

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      expect(files).to.be.ok();
      expect(files).to.be.an('array');
      expect(files[4].url).to.be('/temp/test/1/includes/fileA.js');
      expect(files[5].url).to.be('/temp/test/1/includes/_.fileA.js');
      expect(files[6].url).to.be('/temp/test/1/includes/_.prod.fileA.js');
    });

    it('should handle base paths', function () {
      var resolvedPath,
          match;

      test.path = testHelper.sampleTests('base_paths.js'),

      files = test.prepareIncludes(
        test.resolveAnnotations(
          test.parseTestFile(test.path).annotations
      ));

      resolvedPath = files[4].fs;
      match = '/test/data/sample_fs/foo/empty_file.js';
      expect(resolvedPath.indexOf(match) + match.length).to.be(resolvedPath.length);
    });

    it('should use the correct http root for test files', function () {
      var httpRoot = test.getHttpRoot(1),
          home;

      if (process.platform === 'win32') {
        home = process.env['USERPROFILE'];
      } else {
        home = process.env['HOME'];
      }

      expect(httpRoot).to.be(path.resolve(home, '.venus_temp', 'test', '1'));
    });
  });

  describe('Usage of @venus-execute annotation', function () {
    describe('Load script to execute', function () {
      it('should get correct path for execute script', function () {
        var expectedPath = 'execute/setup.js', annotations;

        test.path   = testHelper.sampleTests('execute.js');
        testData    = test.parseTestFile(test.path).annotations;
        annotations = test.resolveAnnotations(testData);

        expect(annotations['venus-execute']).to.eql([expectedPath]);
      });

      it('should require module', function () {
        var annotations, scripts;

        test.path   = testHelper.sampleTests('execute.js');
        testData    = test.parseTestFile(test.path).annotations;
        annotations = test.resolveAnnotations(testData);
        scripts     = test.prepareExecuteScripts(annotations);

        expect(scripts.length).to.be(1);
        expect(scripts[0].before()).to.be('before hook');
        expect(scripts[0].transform()).to.be('transform hook');
      });
    });
  });
});
