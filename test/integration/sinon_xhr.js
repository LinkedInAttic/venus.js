var testHelper = require('../lib/helpers'),
    expect = require('expect.js');

describe('Run a test which uses the mock XHR object', function () {
  it('should work with phantom', function (done) {
    var process, args;

    args = ['run', '--test', testHelper.sampleTests('xhr/sinon_xhr_mocha.js'), '-n'];
    process = testHelper.runVenus(args, false);

    process.on('close', function (code) {
      expect(code).to.be(0);
      done();
    });
  });

  it('should work with IE9', function (done) {
    runWithSelenium.call(
      this,
      done,
      testHelper.sampleTests('xhr/sinon_xhr_mocha'),
      'internet explorer|9.0'
    );
  });

  it('should work with IE8', function (done) {
    runWithSelenium.call(
      this,
      done,
      testHelper.sampleTests('xhr/sinon_xhr_mocha'),
      'internet explorer|8.0'
    );
  });

  it('should work with IE7', function (done) {
    runWithSelenium.call(
      this,
      done,
      testHelper.sampleTests('xhr/sinon_xhr_mocha'),
      'internet explorer|7.0'
    );
  });
});

function runWithSelenium(done, test, browser) {
  var process, args;

  this.timeout(5000);

  args = [
    'run',
    '--test',
    test,
    '--selenium',
    'supergrid.corp',
    '--browser',
    browser
  ];

  process = testHelper.runVenus(args, true);

  process.on('close', function (code) {
    expect(code).to.be(0);
    done();
  });
}
  
  
