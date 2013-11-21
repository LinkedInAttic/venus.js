.. _annotations:

**********************
Annotations
**********************

Venus allows you to use comment-based annotations to define configurations for your unit test:

--------------
@venus-library
--------------

Indicates the test library you wish to use. The test libraries that are currently supported are ``mocha``, ``jasmine`` and ``qunit`` (Default value is mocha).

Example using the mocha test library:

.. code-block:: javascript

  /**
   * @venus-library mocha
   */

--------------
@venus-include
--------------

JavaScript file to include with your unit test. Use a seperate ``@venus-include`` annotation for every file you wish to include. The path is relative to the location of your test file.

.. code-block:: javascript

  /**
   * @venus-include dependency1.js
   * @venus-include foo/dependency2.js
   * @venus-include ../bar/dependency3.js
   */

--------------------
@venus-include-group
--------------------

Includes the given include group. An include group is a set of JavaScript files to include, defined in the Venus config (``.venus/config``).

For example, let's say we want to include a group named ``groupA``, which will include fileA.js and fileB.js

.. code-block:: javascript

  /**
   * @venus-include-group groupA
   */

But before we can actually use that annotation, we need to update our Venus config to define what files are included with ``groupA``

.. code-block:: javascript

  {
    // Include groups
    includes: {
      groupA: [
          'fileA.js',
          'fileB.js'
      ],
      groupB: [
        ...
      ]
    }

  }

--------------
@venus-fixture
--------------

The location of the file that will include HTML on the test harness page. This is useful for including some DOM elements that your JavaScript control depends on. The path is relative to the location of your test file.

Example:

.. code-block:: javascript

  /**
   * @venus-fixture fixtures/Greeter.html
   */

--------------------
@venus-fixture-reset
--------------------

Disable the behavior of resetting test HTML fixtures after each test executes (default value is true)

Example:

.. code-block:: javascript

  /**
   * @venus-fixture-reset false
   */

---------------
@venus-template
---------------

The location of the file that will serve as your test harness page for your unit test. You typically will not need to use this annotation, unless you are doing something extremely custom (Default value is ``.venus/templates/default.tl``).

Example:

.. code-block:: javascript

  /**
   * @venus-template templates/mytemplate.tl
   */

--------------
@venus-code
--------------

This annotation is used to include the source code file which is under test. Files included with ``@venus-code`` are eligible for code coverage instrumentation, whereas
files included with ``@venus-include`` are not.

.. code-block:: javascript

  /**
   * @venus-code widget.js
   */

---------------
@venus-resource
---------------

Make external files available within the sandbox. This makes it possible to do such things as fetching files via AJAX in your unit test.

Here is an example:

.. code-block:: javascript

  /**
   * @venus-library mocha
   * @venus-include jquery.js
   * @venus-resource data1.txt
   * @venus-resource foo/data2.txt
   * @venus-resource foo/bar/data3.txt
   * @venus-resource ../biz/data4.txt
   */

  describe('@venus-resource annotation', function() {
    it('should retrieve data1.txt', function(done) {
      $.get(location.href + '/data1.txt')
      .success(function() {
        expect(true).to.be(true);
        done();
      })
    });

    it('should retrieve data2.txt', function(done) {
      $.get(location.href + '/foo/data2.txt')
      .success(function() {
        expect(true).to.be(true);
        done();
      })
    });

    it('should retrieve data3.txt', function(done) {
      $.get(location.href + '/foo/bar/data3.txt')
      .success(function() {
        expect(true).to.be(true);
        done();
      })
    });

    it('should retrieve data4.txt', function(done) {
      $.get(location.href + '/biz/data4.txt')
      .success(function() {
        expect(true).to.be(true);
        done();
      })
    });
  });

--------------
@venus-execute
--------------

Run code in Node.js before a test runs in the browser.

For example, let's say you have the following files:
  - ``Tree.js``
  - ``setup.js``
  - ``setup_async.js``
  - ``Tree.spec.js``

``Tree.spec.js`` is a unit test file for ``Tree.js``. However, We need ``setup.js`` and ``setup_async.js`` to execute before any unit tests are ran in ``Tree.spec.js``

In order to do so, we can define the files as follows:

``Tree.js``

.. code-block:: javascript

  function Tree(id) {
    this.id = id;
  }

``setup.js``

.. code-block:: javascript

  module.exports.before = function (ctx) {
    console.log('before hook:', ctx);
  };

``setup_async.js``

.. code-block:: javascript

  module.exports.before = function (ctx) {
    var when, def;

    try {
      when = require('when');
    } catch (e) {
      console.log('Run `npm install -g when` before running this example');
      return;
    }

    def  = when.defer();

    setTimeout(function () {
      console.log('before hook: 5 seconds later...');
      console.log('before hook ctx:', ctx);
      def.resolve();
    }, 5000);

    return def.promise;
  };

``Tree.spec.js``

.. code-block:: javascript

  /**
   * @venus-library mocha
   * @venus-code ./Tree.js
   * @venus-execute ./setup.js
   * @venus-execute ./setup_async.js
   */

  describe('Tree', function() {
    var tree;

    before(function () {
      tree = new Tree(23);
    });


    it('should have the correct id', function () {
      expect(tree.id).to.be(23);
    });

  });

NOTE: Currently, we only support the ``before`` hook. We plan to support additional hooks in the future such as ``after``, ``beforeEach``, and ``afterEach``
