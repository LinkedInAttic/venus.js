/*
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 **/

/**
 * Controls the Venus UI
 */
var conf, $resultsView, $sandboxView;
function VenusUi(config) {
  conf = config;
  $resultsView = $('#results-view');
  $sandboxView = $('#sandbox-view');

  showResults();

  $('#results-button').click(function () {
    showResults();
  });

  $('#sandbox-button').click(function () {
    showSandbox();
  });

  $(document).on('results', onResults);
}

function showResults() {
  $sandboxView.removeClass('active');
  $resultsView.show();
  $('#results-button').parent().addClass('selected');
  $('#sandbox-button').parent().removeClass('selected');
}

function showSandbox() {
  $resultsView.hide();
  $sandboxView.addClass('active');
  $('#results-button').parent().removeClass('selected');
  $('#sandbox-button').parent().addClass('selected');
}


function onResults (e, results) {
  if (results.done.failed === 0) {
    successNav();
  } else {
    failNav();
  }

  printResults(results);
}

function failNav () {
  conf.nav.addClass('error');
}

function successNav() {
  conf.nav.addClass('success');
}

function printResults(results) {
  var template = _.template($('#results-template').html());

  $('#results-view').html(template({
    tests: results.tests
  }));
  return;

  if(!result.tests || !result.done) return false;

  console.log( '\n--------------------------------------------------------' );
  console.log( '\n' );
  console.log( this.getFriendlyBrowserName( result.userAgent ).yellow );

  result.tests.forEach(function(test) {
    console.log('\n   ' + test.name);

    if (test.status === 'PASSED') {
      console.log('\r     ✓'.green + ' ' + test.message.green);
    } else {
      console.log('\r     x'.red + ' ' + test.message.red);
    }

    if (test.stackTrace) {
      console.log('\r   ' + test.stackTrace);
    };

    console.log('\r');
  });

  if (result.done.failed === 0) {
    var content = result.done.passed === 1 ? ' test completed' : ' tests completed',
    message = '\n✓' + ' ' + result.done.passed.toString() + content +
      ' (' + result.done.runtime.toString()  + 'ms)';

    console.log(message.green);
  } else {
    var content = result.done.failed === 1 ? ' test failed' : ' tests failed',
    message = '\nx' + ' ' + result.done.failed.toString() + ' of ' + result.done.total.toString() + content +
      ' (' + result.done.runtime.toString()  + 'ms)';

    console.log(message.red);
  }

  console.log('\r');
  return true;
}
