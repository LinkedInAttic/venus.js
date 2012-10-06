Venus 
---

Venus is a testing tool for JavaScript (JS), which simplifies running unit tests. When you are developing a browser-based project in JS,
you'll want to create unit tests and run them frequently. Typically, you'll write a unit test using some library, such as Mocha or Jasmine.
These libraries let you define testcases (or "specs" if you are following a BDD style), and provide APIs for writing assertions.

To run one of your tests in the browser, you typically need to generate a test fixture page. The fixture page is simply an HTML page which includes
several JS files:

* Your testing library of choice
* Other libraries your code depends on (such as jQuery)
* The code you want to test (such as foo.js)
* The testcase, or spec for the code you are testing (such as foo_test.js)
* Some initialization code to tell the testing library to start running the tests

You may also include some DOM elements for your test to interact with, or for the testing library to display results.

For example, your test fixture might look something like this:

```html
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test for Foo</title>
    <script type="text/javascript" src="lib/jquery.js"></script>
    <script type="text/javascript" src="lib/testing_library.js"></script>
    <script type="text/javascript" src="foo.js"></script>
    <script type="text/javascript" src="test/foo_test.js"></script>
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

  1. Generating this test fixture page is often a manual process
  2. Running the test is a manual process of launching a browser
  3. There is often no easy way to integrate running tests from an IDE, since there is no command line output from running the test

##Venus to the rescue
Venus strives to solve these problems without re-inventing the wheel. Rather than create an entirely new testing library, we set out to create
a tool to make it easier for you to work with an existing library. Here are the main benefits of Venus:

  * Use *Simple annotations* in your tests to specify which testing library you want to use, the file you are testing, other file dependencies,
    and a test fixture page template
  * Quickly run your browser-based tests directly from the command line using PhantomJS
  * Run your tests from the command line in multiple browsers (running locally or remotely) at the same time
  * Integration with Continuous Integration tools (Hudson + Selenium Grid)

###Annotations

In your test file, the following annotations are supported:

* @venus-fixture - Specify either an HTML string or the name of a template (no file extension) under `.venus/templates/...`.  The contents will get included into the template specified by @venus-template.
* @venus-include - JavaScript file to include with your test suite.  Use an annotation for every file you wish to include.
* @venus-library - Indicates the testing library/framework you wish to use.  [QUnit](http://www.qunitjs.com) and [Mocha](http://visionmedia.github.com/mocha/) are the only libraries currently supported.
* @venus-template - Specify the name of the test fixture template (under `.venus/templates`, no file extension) you want to include for your test suite.  

###Configuration

###Run tests from the command line

###Remote browsers

###Continuous Integration support

##Get started

To get started, run "npm install" from the root directory to install dependencies. See http://npmjs.org/ for more information on installing npm.

To start the app, run "bin/venus" from the root.

See /test/data/sample_mocha.js for a sample test set. Checkout the wiki for more info.