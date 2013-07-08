/**
 * @venus-library mocha
 */

describe('Simple test using fake XHR', function() {
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

  it('should load content from server', function() {
    var requestUrl, serverResponseData, xhr;

    requestUrl = 'http://www.venusjs.org/pirate';

    // Create some data for dummy server response
    serverResponseData = 'Seth';

    // Make a request
    xhr = new XMLHttpRequest();
    xhr.onload = function () {
      expect(this.responseText).to.be('Seth');
    };

    xhr.open('get', requestUrl);

    // Make sure the correct HTTP request was sent from client
    expect(xhrRequests[0].url).to.be(requestUrl);

    // Simulate responding to the XHR Request
    xhrRequests[0].respond(
      200,
      {'Content-Type': 'text/html'},
      serverResponseData
    );
  });
});
