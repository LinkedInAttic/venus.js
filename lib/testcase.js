'use strict';
/**
 * Parses a testcase (or spec)
 * @author LinkedIn
 */
var fs       = require('fs'),
    comments = require('./util/commentsParser'),
    config   = require('./config');

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
  var result    = this.parseTestFile(path);
  this.metaData = result.metaData;
  this.id       = id;
  this.url      = {
    run: runUrl
  };

  this.fixtureTemplate = this.loadFixtureTemplate(this.metaData);
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
