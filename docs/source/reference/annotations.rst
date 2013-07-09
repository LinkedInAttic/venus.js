.. _annotations:

**********************
Annotations
**********************

Venus allows you to use comment-based annotations to define configurations for your unit test:

--------------
@venus-library
--------------

Indicates the test library you wish to use. The test libraries that are currently supported are ``mocha``, ``jasmine`` and ``qunit`` (Default library is Mocha)

--------------
@venus-include
--------------

JavaScript file to include with your unit test. Use a seperate ``@venus-include`` annotation for every file you wish to include. The path is relative to the location of your test file.

--------------------
@venus-include-group
--------------------

Includes the given include group. An include group is a set of JavaScript files to include, defined in the Venus config.

For example, let's say we want to include a group named ``groupA``, which will include fileA.js and fileB.js::
	
  /**
   * @venus-include-group groupA
   */

But before we can actually use that annotation, we need to update our Venus config to define what files are included with ``groupA``::

  {
    libraries: {
      ...  
    },

    // Include groups
    includes: {
      groupA: [
          'fileA.js',
          'fileB.js'
      ],
      groupB: [
        ...
      ]
    },
  	...                                                                                                                                                                                                                                              
  }

--------------
@venus-fixture
--------------

The location of the file that will include HTML on the test harness page. This is useful for including some DOM elements that your JavaScript control depends on, for example. The path is relative to the location of your test file.

---------------
@venus-template
---------------

The location of the file that will serve as your test harness page for your unit test ``(Default file is .venus/templates/default.tl)``

Example::

  /**
   * @venus-library mocha
   * @venus-include ../src/Greeter.js
   * @venus-fixture ../fixtures/Greeter.html
   * @venus-tempalte custom
   */
