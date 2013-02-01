/*global it, describe*/

/**
 * @author LinkedIn
 */
var should        = require('../lib/sinon-chai').chai.should(),
    coverage      = require('../../lib/coverage'),
    helpers       = require('../lib/helpers');

describe('lib/coverage/index', function () {
  it('should format', function () {
    var data, results;

    data = helpers.codeCoverageData('1');
    results = coverage.parse(data);

    Object.keys(results).length.should.eql(7);
  });
});
