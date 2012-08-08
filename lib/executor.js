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
    socketio    = require('socket.io'),
    testcase    = require('./testcase'),
    testrun     = require('./testrun'),
    phantom     = require('./runners/phantom'),
    _           = require('underscore'),
    _s          = require('underscore.string'),
    dust        = require('dustjs-linkedin'),
    pathHelper  = require('./util/pathHelper');

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
  var testgroup,
      runners = this.runners = [];

  this.initEnvironment(config);

  // Parse the list of relative paths specified in the command line arguments
  // in to an array of testcase objects.
  testgroup = this.testgroup = testrun.create(this.parseTests(config.test));

  // If no tests were selected to run, there is nothing to do.
  // log an error and return.
  // TODO: we may want to change this to throw an exception.
  if(testgroup.testCount === 0) {
    logger.error( i18n('No tests specified to run - exiting') );
    return false;
  }

  // If overlord option is selected, connect to overlord
  // defaults to not using an overlord.
  if(config.overlord) {
    logger.info( i18n('Connecting to Overlord - %s', config.overlord) );
    this.connectOverlord(config.overlord, testgroup);
  }

  // If phantomjs is selected, start the browsers.
  if(config.phantom) {
    logger.verbose( i18n('Creating phantom runners') );
    this.runners = runners.concat(this.createPhantomRunners(config));
  }

  this.initRoutes();
  this.start(this.port);
  this.startSocketIOServer(this.port + 1);
  setTimeout(_.bind(function() { this.runTests(); }, this), 1000);
}

/**
 * Start socketio server for test clients to communicate with
 */
Executor.prototype.startSocketIOServer = function(port) {
  var sioServer,
      print = this.printTestResults,
      tests = this.testgroup.tests;

  sioServer = socketio.listen(port);
  sioServer.set('log level', 1);

  sioServer.sockets.on('connection', function(socket) {
    socket.on('test results', function(data) {
      print(data, tests);
    });

    // Pipe console.log calls through from client
    socket.on('console.log', function(data) {
      data.unshift(i18n('browser:'));
      console.log.apply(this, data);
    });
  });

  this.sioPort = port;
  this.sioServer = sioServer;
}

/**
 * Start test runners!
 */
Executor.prototype.runTests = function() {
  this.runners.forEach(function(runner) {
    runner.runTest();
  });
}

/**
 * Create phantom runners for a test run
 */
Executor.prototype.createPhantomRunners = function() {
  logger.verbose( i18n('Creating phantom runners') );
  return this.testgroup.testArray.map(function(test) {
    return phantom.create(test.url.run);
  });
}

/**
 * Connect to a overlord server
 * @param {string} url the overlord server's url
 */
Executor.prototype.connectOverlord = function(url) {
  var socket;
  socket = this.socket = io.connect(url);

  //testrun.testArray.forEach(function(test) {
    //console.log(test.url.run);
  //});
  //socket.emit('request-open', { url: 'http://www.linkedin.com', id: this.getNextTestId() });
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

  testPaths.forEach(function (path, idx, list) {
    var stat,
        dirContents,
        test,
        testId;

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
       testId = this.getNextTestId();

       test = testcase.create(
         path,
         testId,
         'http://' + hostname + ':' + this.port + '/test/' + testId);

       testObjects[testId] = test;
     } else {
       logger.warn( i18n('skipping invalid test file %s', path) );
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
  var app        = this.app = express(),
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
  app.use('/temp', express.static(homeFolder + '/temp'));

  // port
  this.port = config.port || PORT;
}

/**
 * Set up routes
 */
Executor.prototype.initRoutes = function() {
  var app  = this.app,
      port = this.port,
      exec = this,
      tests = this.testgroup.tests;

  /** Index **/
  app.get('/', function(request, response) {
    response.render('executor/index', { hostname: hostname, port: port });
  });

  /** Run testcase - serve fixture page **/
  app.get('/test/:testid', function(request, response) {
    var tests = exec.testgroup.tests,
        testId = request.params.testid,
        test  = tests[testId],
        fixture,
        templateData;

    // Check if testid is valid and in the currently loaded testgroup
    if(!test) {
        return response.status(404).json(
          { error: 'TestId ' + testId + ' does not exist' }
        );
    }

    // data to pass to fixture template
    templateData = {
      scriptIncludes     : test.url.includes.slice(0, -1),
      testcaseFile       : _.last(test.url.includes),
      testId             : testId,
      port               : exec.sioPort,
      hostname           : hostname
    };

    // Load fixture template for test
    dust.loadSource(dust.compile(test.fixtureTemplate, 'fixture'+testId));
    dust.render('fixture'+testId, templateData, function(err, out) {
      if(err) {
        response.status(500).json(
          { error: 'Fixture template for test ' + testId + ' failed to render' }
        );
      }

      response.send(out);
    });
  });
}

/**
 * Print test results
 * @param {Object} result test results
 */
Executor.prototype.printTestResults = function(results, tests) {
    var testId = results.testId,
        test = tests[testId];


    results.suites.forEach(function(suite) {
      console.log('\n', suite.title.cyan, '(' + test.path.cyan + ')');
      suite.test.forEach(function(test) {
        if(test.status === 'passed') {
          console.log('\n  ✓'.green + ' ' + test.title.green);
        } else {
          var file = pathHelper(testPath).file.replace(/\./, '\.');
          console.log('\n  ' + test.title.red);
          var matchline;
          test.str = test.str.split('\n').map(function(line, idx) {
            if(!matchline || idx < matchline) {
              if( new RegExp(file, 'g').test(line) ) {
                matchline = idx;
              }
              return line + '\n';
            }

            return '';

          }).join('');
          test.str = '  ' + test.str.replace( new RegExp('(' + file + ')', 'g'), '$1'.yellow );
          console.log(test.str);
        }
      });
    });
    process.exit(1);
}

/**
 * Start server
 */
Executor.prototype.start = function(port) {
  var app   = this.app;

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
  instance.init(config);
  return instance;
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
