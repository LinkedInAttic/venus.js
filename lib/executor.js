'use strict';
var PORT      = 2013,
    express   = require('express'),
    hostname  = require('os').hostname(),
    colors    = require('colors'),
    path      = require('path'),
    i18n      = require('./util/i18n'),
    logger    = require('./util/logger'),
    io        = require('socket.io-client');

/**
 * Test executor, responsible for running tests
 * /lib/executor.js
 * @author LinkedIn
 */
function Executor(config) {
  var app       = express.createServer();
  var testId    = 1;
  var homeFolder;
  var port;
  var socket;

  init(config);

  /**
   * Initialize
   */
  function init(config) {
    connectOverlord(config.overlordUrl);
    initEnvironment(config);
    initRoutes();
    start(port);
  }

  /**
   * Connect to a overlord server
   * @param {string} url the overlord server's url
   */
  function connectOverlord(url) {
    socket = io.connect(url);
    socket.emit('request-open', { url: 'http://www.linkedin.com', id: getNextTestId() });
  }

  /**
   * Get a new test id
   */
  function getNextTestId() {
    return testId++;
  }

  /**
   * Set up application environment
   */
  function initEnvironment(config) {
    homeFolder = config.homeFolder;

    // express config
    app.set('view engine', 'ejs');
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
    port = config.port || PORT;
  }

  /**
   * Set up routes
   */
  function initRoutes() {

    /** Index **/
    app.get('/', function(request, response) {
      response.render('executor/index', { hostname: hostname, port: port });
    });

    /** Capture **/
    app.get('/test/:testcases', function(request, response) {
      response.render('executor/fixture', { hostname: hostname, port: port });
    });

  }

  /**
   * Start server
   */
  function start(port) {
    try {
      app.listen(port);
      logger.info('executor started on ' + hostname + ':' + port);
    } catch(e) {
      start(port+1);
    }
  }
}

/**
 * Start a new Executor
 * @param {Object} config options
 */
function start(config) {
  logger.info('Starting the Executor');
  return new Executor(config);
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
