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

 function postTestResults(result) {
   var testId = result.testId,
       passed = !result.done.failed,
       $el = $('#test-' + testId),
       resultClass = (passed) ? 'passed' : 'failed',
       pendingTestCount;

   $el.addClass(resultClass);
   $el.removeClass('pending');

   pendingTestCount = $('.test.pending').length;

   if (pendingTestCount === 0) {
     $('#loading').hide();
   }


 }
