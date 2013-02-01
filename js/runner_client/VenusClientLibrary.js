/**
 * Communicates with the Venus Server
 */
function VenusClientLibrary( config ){
  this.config = config;
  this.socket = null;
}

/**
 * Sets up socket IO connection
 */
VenusClientLibrary.prototype.connect = function(){
  var config = this.config;

  this.socket = io.connect(
    config.host,
    { port: config.port }
  );
};

/**
 * Called when test is done running
 * @param {Object} results the test results
 */
VenusClientLibrary.prototype.done = function( results ){
  var sandbox = document.getElementById('sandbox');

  results.userAgent = window.navigator.userAgent;
  results.codeCoverageData  = sandbox.contentWindow.__coverage__;
  this.socket.emit( 'results', results );
};

/**
 * Forward a console.log message to server
 * @param {String} str the log message
 */
VenusClientLibrary.prototype.log = function( str ){
  this.socket.emit( 'console.log', str );
};
