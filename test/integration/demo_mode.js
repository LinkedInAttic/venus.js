var testHelper = require('../lib/helpers'),
    expect = require('expect.js');

describe('Running Venus.js in demo mode', function () {
  it('should return exit code 0 (success)', function (done) {
    testHelper.runVenus(['demo'])
      .on('close', function (code) {
        expect(code).to.be(0);
        done();
      });
  });
});
  
  
