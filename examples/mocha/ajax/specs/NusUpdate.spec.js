/**
 * Test for NusUpdate JS Control
 * @author Seth McLaughlin
 *
 * @venus-library mocha
 * @venus-include ../src/jquery.js
 * @venus-code ../src/NusUpdate.js
 * @venus-fixture NusUpdate.fixture.html
 */

describe('NusUpdate Control', function() {
  var xhr, xhrRequests;

  // Executed before any tests run
  before(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    xhrRequests = [];

    xhr.onCreate = function(req) {
      xhrRequests.push(req);
    };
  });

  // Executed before each test runs
  beforeEach(function() {
    xhrRequests = [];
  });

  // Executed after all tests run
  after(function() {
    xhr.restore();
  });

  it('should load content from server and inject in to DOM', function(done) {
    var $container, config, control, data;

    // Get reference to container DOM node
    $container = $('#nus-message');

    // Create sample control config. URL doesn't matter since we are intercepting
    // AJAX request.
    config = { dataUrl: 'http://www.foo.com/service/nus/?43' };

    // Create JS Control
    control = new NusUpdate($container, config);

    // Create some data for dummy server response
    serverResponseData = {
      title: 'News',
      name: 'Seth',
      text: 'JS Unit Testing'
    };

    // Ask control to load data from server
    control.loadData(function() {
      // Make sure DOM has been modified correctly
      expect( $('h1', $container).html() ).to.be(serverResponseData.title);
      expect( $('h2', $container).html() ).to.be(serverResponseData.name);
      expect( $('p', $container).html() ).to.be(serverResponseData.text);
      done();
    });

    // Make sure the correct HTTP request was sent from client
    expect( xhrRequests[0].url ).to.be( config.dataUrl );

    // Simulate responding to the XHR Request
    xhrRequests[0].respond(
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(serverResponseData)
    );
  });
});
