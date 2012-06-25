/**
 * /lib/executor.js
 * @author LinkedIn
 */
var colors    = require('colors'),
    i18n      = require('./i18n'),
    io        = require('socket.io-client');

/**
 * Test executor, responsible for running tests
 */
function Executor(config) {
  var testId = 1;

  init(config);

  /**
   * Initialize
   */
  function init(config) {
    connectMaster('http://localhost:2012');
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
}

/**
 * Start a new Executor
 * @param {Object} config options
 */
function start(config) {
  console.log('starting the executor!');
  return new Executor(config);
}

module.exports.start = start;
