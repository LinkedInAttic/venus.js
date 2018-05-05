* Venus.js Mailing List: https://groups.google.com/forum/#!forum/venusjs
* irc: #venusjs on freenode
* Documentation: http://venusjs.readthedocs.io/en/latest/
* 2.x: [![View Summary](https://secure.travis-ci.org/linkedin/venus.js.png?branch=2.x)](http://travis-ci.org/#!/linkedin/venus.js/branch_summary)

##Dependencies

* [Node.js v0.8.8](http://nodejs.org/dist/v0.8.8/)
* [PhantomJS](http://www.phantomjs.org)

## Overview

Venus is a testing tool for JavaScript (JS), which simplifies running unit tests. When you are developing a browser-based project in JS,
you'll want to create unit tests and run them frequently. Typically, you'll write a unit test using some library, such as Mocha or Jasmine.
These libraries let you define testcases (or "specs" if you are following a BDD style), and provide APIs for writing assertions.

To run one of your tests in the browser, you need to have a test harness page. The harness page is simply an HTML document which includes
several JS files:

* Your testing library of choice
* Other libraries your code depends on (such as jQuery)
* The code you want to test (such as foo.js)
* The testcase, or spec for the code you are testing (such as foo.spec.js)
* Some initialization code to tell the testing library to start running the tests

You may also include some DOM elements for your test to interact with, or for the testing library to display results.

For example, your test harness might look something like this:

```html
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test for Foo</title>
    <script type="text/javascript" src="lib/jquery.js"></script>
    <script type="text/javascript" src="lib/testing_library.js"></script>
    <script type="text/javascript" src="foo.js"></script>
    <script type="text/javascript" src="specs/foo.spec.js"></script>
    <script type="text/javascript">
        testLibrary.run();
    </script>
  </head>
  <body>
    <div id="results"></div>
  </body>
  </html>
```
then to run the test, you simply load this page in any web browser. This works, but it presents some problems:

  1. Generating this test harness page is often a manual process
  2. Running the test is a manual process of launching a browser, and visually inspecting the page for results
  3. There is often no easy way to integrate running tests from an IDE, since there is no command line output from running the test

##Venus to the rescue
Venus strives to solve these problems without re-inventing the wheel. Rather than create an entirely new testing library, we set out to create
a tool to make it easier for you to work with an existing library. Here are the main benefits of Venus:

  * Use *Simple annotations* in your tests to specify which testing library you want to use, the file you are testing, other file dependencies,
    and a test harness template
  * Quickly run your browser-based tests directly from the command line using PhantomJS
  * Run your tests from the command line in multiple browsers (running locally or remotely) at the same time
  * Integration with Continuous Integration tools (Selenium Grid + Travis CI)

###Annotations

In your test file, the following annotations are supported:

* @venus-library - Indicates the testing library/framework you wish to use.  [QUnit](http://www.qunitjs.com), [Mocha](http://mochajs.org/), and [Jasmine](http://pivotal.github.com/jasmine/) are supported out of the box.
* @venus-code - JavaScript source code under test.
* @venus-include - Other JavaScript file dependency to include with your test suite.  Use an annotation for every file you wish to include.
* @venus-fixture - Specify either an HTML string or the name of a template under `.venus/templates/...`.  You can also specify a path relative to where the test file resides. The contents will get included into the template specified by @venus-template.
* @venus-template - Specify the name of the test harness template (under `.venus/templates`, no file extension) you want to include for your test suite.

##Get started

Visit the project page at http://venusjs.readthedocs.io/en/latest/ for more information.
