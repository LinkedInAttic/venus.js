'use strict';
/**
 * Parses a testcase (or spec)
 * @author LinkedIn
 */
var fs         = require('fs'),
    comments   = require('./util/commentsParser'),
    pathHelper = require('./util/pathHelper'),
    logger     = require('./util/logger'),
    i18n       = require('./util/i18n'),
    pathm      = require('path'),
    config     = require('./config'),
    async      = require('async'),
    fstools    = require('fs-tools'),
    stringUtil = require('./util/stringUtil');

/**
 * Represents a single testcase file
 */
function TestCase(conf) {
  this.config = conf || config.instance();
}

/**
 * Initialize
 */
TestCase.prototype.init = function(path, id, runUrl) {
  var testData  = this.parseTestFile(path);

  this.src             = testData.src;
  this.path            = testData.path;
  this.directory       = testData.directory;
  this.annotations     = this.resolveAnnotations(testData.annotations);
  this.id              = id;
  this.url             = { run: runUrl };

  this.fixtureTemplate = this.loadFixtureTemplate(this.annotations);
  this.url.includes    = this.copyFilesToHttpPath(
                          this.prepareIncludes(this.annotations)
                         ).urls;
}

/**
 * Resolve annotations
 * Use default values for missing annotations
 */
TestCase.prototype.resolveAnnotations = function(annotations) {
  var config  =  this.config,
      library = annotations['venus-library'],
      include = annotations['venus-include'],
      fixture = annotations['venus-fixture'];

  if( !library ) {
    library = config.get('default.library').value;
    if (!library) {
      throw {
        name: "LibraryException",
        message: "The default library is not defined in .venus/config"
      };
    }
  } else if( Array.isArray(library) ) {
    library = library[0];
  }

  annotations['venus-library'] = library;

  if( !include ) {
    include = [];
  } else if( !Array.isArray(include) ) {
    include = [include];
  }

  annotations['venus-include'] = include;

  // If the fixture is not HTML, attempt to load the file.
  // If the file load fails, use an empty string as the template
  if (!stringUtil.hasHtml(fixture)) {
    fixture = config.loadTemplate(fixture);
    if (!fixture || !fixture.length) {
      fixture = '';
    }
  }
  annotations['venus-fixture'] = fixture;

  return annotations;
}

/**
 * Prepare testcase includes - there are the files
 * to be included on the test fixture page in the browser
 */
TestCase.prototype.prepareIncludes = function(annotations) {
  var library = annotations['venus-library'],
      testId = this.id,
      config  = this.config,
      libraryFile,
      adaptorFile,
      httpRoot,
      httpResourceUrls,
      libDest,
      adaptorDest,
      includes = [],
      fileMappings = [],
      includeFiles = annotations['venus-include'];

  httpRoot = pathm.resolve(__dirname + '/../temp/test/' + testId);
  httpResourceUrls = [];

  includes = config.resolve('libraries.' + library + '.includes');

  if(!includes) {
    includes = [];
  }

  if(!Array.isArray(includes)) {
    includes = [includes];
  }

  includes = includes.map(function(include) {
    return { path: include, httpDir: 'lib' };
  });

  // Add files specified with @venus-include annotations
  includeFiles.forEach(function(filePath) {

    // if path doesn't begin with a '/' character, we assume it
    // is relative and needs to be resolved relative
    // to the directory the testcase file lives in
    if(filePath[0] !== '/') {
      filePath = pathm.resolve( this.directory + '/' + filePath );
    }

    includes.push({ path: filePath, httpDir: 'includes' });
  }, this);

  // Add the testcase file
  includes.push({ path: this.path, httpDir: 'test' });

  // Take list of files to be included and copy them to a temporary location
  // on the server. The path is {venus install location}/temp/test/{testid}/includes
  includes.forEach(function(include) {
    var filePath    = include.path,
        httpDir     = include.httpDir,
        destination = pathm.resolve(httpRoot + '/' + httpDir + '/' + pathHelper(filePath).file),
        httpUrl     = '/' + destination.substr( destination.indexOf('temp/test/'+testId) );

    // Add to list of file mappings
    //  fs   = original file path on disk
    //  http = relative http path to file on server
    fileMappings.push({
      fs: filePath,
      http: destination,
      url: httpUrl
    });

  });

  return fileMappings;
}

/**
 * Copy dependencies to http root
 * @param {Array} files
 */
TestCase.prototype.copyFilesToHttpPath = function(files) {
    var urls = [];

    files.forEach(function(path) {
      urls.push(path.url);

      // copy the file
      fstools.copy(path.fs, path.http, function(err) {
        if(err) {
          logger.error( i18n('Error copying test file %s. Exception: %s', path.http, err) );
        }
      });
    });

    return { urls: urls};
}

/**
 * Load test fixture template
 */
TestCase.prototype.loadFixtureTemplate = function(annotations) {
  var fixtureFilePath,
      fixtureName = annotations['venus-template'],
      config = this.config,
      src;

  // If fixture is specified in config, then get that fixture
  // file
  if(fixtureName) {
    return config.loadTemplate(fixtureName);
  } else {
    return config.loadTemplate('default');
  }
}

/**
 * Parse a test case file
 */
TestCase.prototype.parseTestFile = function(file) {
  var fileContents = fs.readFileSync(file).toString();

  return {
    path     : file,
    directory: pathm.resolve( file.split('/').slice(0, -1).join('/') ),
    src      : fileContents,
    annotations : comments.parseStr(fileContents)
  };
}

/**
 * Create a new TestCase object
 * @param {String} path the absolute path to testcase file
 * @param {String} id the test id
 * @param {String} runUrl the url to load to run the test
 */
function create(path, id, runUrl) {
  var instance = new TestCase();
  instance.init(path, id, runUrl);
  return instance;
}

module.exports.TestCase = TestCase;
module.exports.create = create;
Object.seal(module.exports);
