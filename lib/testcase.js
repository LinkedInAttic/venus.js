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
    fstools    = require('fs-tools');

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
  this.testPath = path;
  var result    = this.parseTestFile(path);
  this.metaData = result.metaData;
  this.id       = id;
  this.url      = {
    run: runUrl
  };

  this.fixtureTemplate = this.loadFixtureTemplate(this.metaData);
  this.prepareDependencies(this.metaData);
}

/**
 * Prepare dependencies
 */
TestCase.prototype.prepareDependencies = function(settings) {
  var library = settings['venus-library'],
      config  = this.config,
      lib,
      adaptor,
      root,
      libDest,
      adaptorDest,
      includeFiles;

  if(!library) {
    library = config.get('default.library').value;
  }

  root = pathm.resolve(__dirname + '/../temp/test/' + this.id);

  lib = config.resolve('libraries.' + library + '.library');
  adaptor = config.resolve('libraries.' + library + '.adaptor');

  libDest = pathm.resolve(root + '/' + pathHelper(lib).file)
  adaptorDest = pathm.resolve(root + '/' + pathHelper(adaptor).file)

  //async.parallel([
    //function() { fstools.copy(lib, dest); }
    //], function() {
      //console.log('copied');
    //});
  //

  fstools.copy(lib, libDest, function(err) { console.log(err); });
  fstools.copy(adaptor, adaptorDest, function(err) { console.log(err); });

  this.frameworkUrls = [
    '/' + libDest.substr( libDest.indexOf('temp/test/'+this.id) ),
    '/' + adaptorDest.substr( adaptorDest.indexOf('temp/test/'+this.id) )
  ];

  includeFiles = settings['venus-include'];

  if(includeFiles && !Array.isArray(includeFiles)) {
    includeFiles = [includeFiles];
  }

  this.includeUrls = [];
  includeFiles.forEach(function(file) {
    var dest = pathm.resolve(root + '/' + pathHelper(file).file);
    fstools.copy(file, dest, function(err) {
      if(err) {
        logger.error( i18n('Error copying include file %s. Exception: %s', file, err) ); 
      }
    });

    this.includeUrls.push('/' + dest.substr( libDest.indexOf('temp/test/'+this.id) ) );
  }, this);

  var testDest = pathm.resolve(root + '/' + pathHelper(this.testPath).file);
  fstools.copy(this.testPath, testDest, function(err) {
    if(err) {
      logger.error( i18n('Error copying test file %s. Exception: %s', file, err) );
    }
  });
  this.testUrl = '/' + testDest.substr( testDest.indexOf('temp/test/'+this.id) );
}

/**
 * Load test fixture template
 */
TestCase.prototype.loadFixtureTemplate = function(settings) {
  var fixtureFilePath,
      fixtureName = settings['venus-template'],
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
    src      : fileContents,
    metaData : comments.parseStr(fileContents)
  };
}

/**
 * Define properties
 */
//TestCase.prototype.defineProperties = function() {
  //Object.defineProperties(this, {
  //});
//}

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
