/*global it, describe*/

/**
 * @author LinkedIn
 */
var expect        = require('expect.js'),
    coverage      = require('../../lib/coverage'),
    helpers       = require('../lib/helpers');

describe('lib/coverage/index', function () {
  it('should format', function () {
    var data, results;

    data = helpers.codeCoverageData('1');
    results = coverage.parse(data);

    expect(Object.keys(results).length).to.be(7);
  });
});
