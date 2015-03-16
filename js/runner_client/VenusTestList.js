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

var VenusTestList = {

  constants: {
    PASSED : 'passed',
    FAILED : 'failed',
    PENDING : 'pending',
  },

  selectors: {
    TEST_CLASS: '.test',
    TEST_ID: '#test-',
    LOADER: '#loading'
  },
  /**
   * Shows the test result status ('failed', 'pending', 'passed')
   *
   * @param {Object} result
   */
  postTestResults: function(result) {

    var testId = result.testId,
        $el = $(this.selectors["TEST_ID"] + testId),
        resultClass = (!result.done.failed) ? this.constants["PASSED"] : this.constants["FAILED"];

    // reset the status of the result
    $el.removeClass([this.constants["PASSED"], this.constants["FAILED"], this.constants["PENDING"]].join(' '));

    // update the status of the result
    $el.addClass(resultClass);

    // hide the loading indicator if there are no pending tests
    if (!$(this.selectors["TEST"] + '.' + this.constants.PENDING).length) {
      $(this.selectors["LOADER"]).hide();
    }
  }
};
