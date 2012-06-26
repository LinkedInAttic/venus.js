'use strict';
var PORT      = 2013;
var express   = require('express');
var hostname  = require('os').hostname();
var colors    = require('colors');
var path      = require('path');
var i18n      = require('./i18n');
var io        = require('socket.io-client');

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

  init(config);

  /**
   * Initialize
   */
  function init(config) {
    connectMaster(config.masterUrl);
    initEnvironment(config);
    initRoutes();
    start();
  }

  /**
   * Connect to a master server
   * @param {string} url the master server's url
   */
  function connectMaster(url) {
    var socket = io.connect(url);
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
    port = parseInt(process.argv[2], 10) || PORT;
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
  function start() {
    app.listen(port);
    console.log('executor started on'.yellow, (hostname + ':' + port).cyan);
  }
}

/**
 * Start a new Executor
 * @param {Object} config options
 */
function start(config) {
  console.log('starting the executor!');
  return new Executor(config);
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
