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
 *
 * @param config - the configuration options
 * @constructor
 */
function VenusUi(config) {
  var self = this;

  this.config = config;
  this.$resultsView = $('#results-view');
  this.$resultsButton = $('#results-button');
  this.$sandboxView = $('#sandbox-view');
  this.$sandboxButton = $('#sandbox-button');
  this.$resultsTemplate = $('#results-template');
  this.ACTIVE_CLASS = 'active';
  this.SELECTED_CLASS = 'selected';

  // show the test results if any and attach the event handlers
  this.showResults();

  this.$resultsButton.click(function () {
    self.showResults();
  });

  this.$sandboxButton.click(function () {
    self.showSandbox();
  });

  $(document).on('results', function () {
    self.onResults.apply(self, arguments);
  });
}

/**
 * Shows the test results
 */
VenusUi.prototype.showResults = function() {
  this.$resultsView.addClass(this.ACTIVE_CLASS);
  this.$sandboxView.removeClass(this.ACTIVE_CLASS);
  this.$resultsButton.parent().addClass(this.SELECTED_CLASS);
  this.$sandboxButton.parent().removeClass(this.SELECTED_CLASS);
};

/**
 * Shows the sandbox fixture
 */
VenusUi.prototype.showSandbox = function() {
  this.$resultsView.removeClass(this.ACTIVE_CLASS);
  this.$sandboxView.addClass(this.ACTIVE_CLASS);
  this.$resultsButton.parent().removeClass(this.SELECTED_CLASS);
  this.$sandboxButton.parent().addClass(this.SELECTED_CLASS);
};

/**
 * Helper function to handle what happens once the test results are available
 *
 * @param {jQuery} e - not used
 * @param {Object} results - the test results
 */
VenusUi.prototype.onResults = function(e, results) {
  if (!results.done.failed) {
    this.successNav();
  } else {
    this.failNav();
  }

  this.printResults(results);
};

/**
 * Shows that at least one test failed
 */
VenusUi.prototype.failNav = function() {
  this.config.nav.addClass('error');
};

/**
 * Shows that no error was encountered
 */
VenusUi.prototype.successNav = function() {
  this.config.nav.addClass('success');
};

/**
 * Prints the results the page
 *
 * @param {Object} results - the test results
 */
VenusUi.prototype.printResults = function(results) {
  var self = this,
      template = _.template(self.$resultsTemplate.html()),
      $resultView = self.$resultsView;

  _.each(results.tests, function(test) {
    self.addTestResults(test, $resultView, template);
  });
};

/**
 * Helper function to actually append the test results to the view
 *
 * @param {Object} test - the test result to display
 * @param {jQuery} $view - the view to which the test result should be appended
 * @param {Function} template - the template used to render the test result
 */
VenusUi.prototype.addTestResults = function(test, $view, template) {
  // html-ize the test message and its stacktrace and append these to the $view using the template
  test.message = this.htmlEncode(test.message);
  test.stackTrace = this.htmlEncode(test.stackTrace);

  $view.append(template({ test: test }));
};

/**
 * Helper function to html-ize some given text
 *
 * @param value - the value to html-ize
 * @returns {String} - html-encoded version of 'value'
 */
VenusUi.prototype.htmlEncode = function(value) {
  return (value) ? $('<div/>').text(value).html() : '';
};
