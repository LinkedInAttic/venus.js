'use strict';
var PORT        = 2013,
    express     = require('express'),
    hostname    = require('os').hostname(),
    colors      = require('colors'),
    path        = require('path'),
    i18n        = require('./util/i18n'),
    logger      = require('./util/logger'),
    consolidate = require('consolidate'),
    portscanner = require('portscanner'),
    fs          = require('fs'),
    pathm       = require('path'),
    io          = require('socket.io-client'),
    testcase    = require('./testcase'),
    _s          = require('underscore.string');

/**
 * Test executor, responsible for running tests
 * /lib/executor.js
 * @author LinkedIn
 */
function Executor() {
  this.testId    = 1;
  this.port;
  this.socket;
}

/**
 * Initialize
 */
Executor.prototype.init = function(config) {
  var tests = this.tests = this.parseTests(config.test);

  if(Object.keys(tests).length === 0) {
    logger.error( i18n('No tests specified to run - exiting') );
    return false;
  }

  this.connectOverlord(config.overlordUrl);
  this.initEnvironment(config);
  this.initRoutes();
  this.start(this.port);
}

/**
 * Connect to a overlord server
 * @param {string} url the overlord server's url
 */
Executor.prototype.connectOverlord = function(url) {
  var socket = this.socket = io.connect(url);
  socket.emit('request-open', { url: 'http://www.linkedin.com', id: this.getNextTestId() });
}

/**
 * Create an array of test case objects from a string of testcase names
 * @param {String} tests
 */
Executor.prototype.parseTests = function(tests) {
  var testObjects = {},
      cwd         = process.cwd(),
      testPaths   = [],
      testNames;

  if( !(typeof tests === 'string' || (typeof tests !== 'undefined' && Array.isArray(tests))) ) {
    return testObjects;
  }

  testNames = tests.split(',');

  testPaths = testNames.map(function(test) {
    return pathm.join(cwd, test);
  });

  testObjects = this.parseTestPaths(testPaths);

  return testObjects;
}

/**
 * Take a list of absolute paths to testcase files, and
 * return array of TestCase objects
 */
Executor.prototype.parseTestPaths = function(testPaths, testObjects) {
  testObjects = testObjects || {};

  testPaths.forEach(function (path) {
    var stat,
        dirContents,
        test;

    // if path does not exist, try adding the .js
    // extension to it
    if(!fs.existsSync(path)) {
      path += '.js';
    }

   try {
     stat = fs.statSync(path);

     // check if testname is a dir or file
     if (stat.isDirectory()) {
       dirContents = fs.readdirSync(path);
       dirContents = dirContents.map(function(file, idx) {
         return pathm.resolve(path, file);
       });

       this.parseTestPaths(dirContents, testObjects);

     } else if(_s.endsWith(path, '.js')) {
       // create test case
       test = testcase.create(path, this.getNextTestId());
       testObjects[test.id] = test;
     } else {
       logger.info( i18n('skipping invalid test file %s', path) );
     }
   } catch(e) {
     logger.error( i18n('Cannot parse %s, %s', path, e ) );
     throw e;
   }
  }, this);

  return testObjects;
}

/**
 * Get a new test id
 */
Executor.prototype.getNextTestId = function() {
  return this.testId++;
}

/**
 * Set up application environment
 */
Executor.prototype.initEnvironment = function(config) {
  var app        = this.app = express.createServer(),
      homeFolder = this.homeFolder = config.homeFolder;

  // express config
  app.engine('tl', consolidate.dust);
  app.set('view engine', 'tl');
  app.set('views', homeFolder + '/views');
  app.set('views');
  app.set('view options', { layout: null });

  app.use (function(req, res, next) {
      var data='';
      req.setEncoding('utf8');
      req.on('data', function(chunk) {
         data += chunk;
      });

      req.on('end', function() {
          req.body = data;
          next();
      });
  });

  // static resources
  app.use('/js', express.static(homeFolder + '/js'));
  app.use('/css', express.static(homeFolder + '/css'));
  app.use('/img', express.static(homeFolder + '/img'));

  // port
  this.port = config.port || PORT;
}

/**
 * Set up routes
 */
Executor.prototype.initRoutes = function() {
  var app  = this.app,
      port = this.port;

  /** Index **/
  app.get('/', function(request, response) {
    response.render('executor/index', { hostname: hostname, port: port });
  });

  /** Run testcase - serve fixture page **/
  app.get('/test/:testid', function(request, response) {
    response.render('executor/fixture', { testId: request.params.testid, hostname: hostname, port: port });
  });

}

/**
 * Start server
 */
Executor.prototype.start = function(port) {
  var app   = this.app,
      retry = this.start;

  portscanner.findAPortNotInUse(port, port + 1000, 'localhost', function(err, port) {
    app.listen(port);
    logger.info('executor started on ' + hostname + ':' + port);
  });
}

/**
 * Start a new Executor
 * @param {Object} config options
 */
function start(config) {
  var instance = new Executor();
  logger.info('Starting the Executor');
  instance.init(config);
  return instance;
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
