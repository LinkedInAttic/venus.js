/**
 * Initialize a new QUnit adaptor
 */
function Adaptor() {}

/**
 * Start the tests!
 */
Adaptor.prototype.start = function() {

  var results = {
    groups: {},
    done: {}
  },
  DEFAULT_groups = 'Venus - Anonymous tests';

  // QUnit calback - log
  QUnit.log(function(data) {

    var module = null,
        test   = null;

    // Retrieve module name (if exists)
    if (data.module === undefined) {
      if (!results.groups.hasOwnProperty(DEFAULT_groups)) {
        results.groups[DEFAULT_groups] = {};
      }
      module = results.groups[DEFAULT_groups];
    }
    else {
      if (!results.groups.hasOwnProperty(data.module)) {
        results.groups[data.module] = {};
      }
      module = results.groups[data.module];
    };

    // Retrieve test name
    if (!module.hasOwnProperty(data.name)) {
      module[data.name] = {
        result: [],
        message: [],
        source: []
      };
    }
    test = module[data.name];

    // Add desired data from test results
    test.result.push(data.result === true ? 'PASSED' : 'FAILED');
    test.message.push(data.message)
    test.source.push(data.source === undefined ? '' : data.source);

  });

  // QUnit calback - done
  QUnit.done(function(data) {

    // Retrieve final test results
    results.done =  {
      passed: data.passed,
      failed: data.failed,
      runtime: data.runtime,
      total: data.total
    }

    // TO DO: Chrome bug (shows global failure due to Chrome extensions)
    /*if (results.groups.hasOwnProperty(DEFAULT_groups) && results.groups[DEFAULT_groups].hasOwnProperty('global failure')) {
      delete results.groups[DEFAULT_groups]['global failure'];
      results.done.failed--;
      results.done.total--;
    };*/

    window.venus.done(data);
  });
};