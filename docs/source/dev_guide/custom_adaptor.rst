.. _custom_adaptor:
.. _adaptors: https://github.com/linkedin/venus.js/tree/master/.venus/adaptors
.. _libraries: https://github.com/linkedin/venus.js/tree/master/.venus/libraries

***************
Build a custom adaptor
***************


Background
----------

Venus uses adaptors to communicate with different test libraries. Each
adaptor normalizes the output of it's respective framework in order for Venus to process the test results.

The libraries currently supported are:

-  `Mocha <http://visionmedia.github.io/mocha/>`_
-  `Jasmine <http://pivotal.github.io/jasmine/>`_
-  `QUnit <http://qunitjs.com/>`_

All adaptors can be found in the `adaptors`_ folder under the root Venus application.

Inside `adaptors`_, you will find a file named
``adaptor-template.js``. This file serves as the base template for all
adaptors.

Example
-------

Let's say we want to create an adaptor for a test framework named FooBar
(library file is named ``foobar.js``)

The first step is to place ``foobar.js`` in `libraries`_.

Next, create a file named ``foobar.js`` and place it in `adaptors`_.

The contents of ``foobar.js`` should do the following:

1. Instantiate the adaptor ``function Adaptor() {};``

2. Inherit the adaptor template
   ``Adaptor.prototype = new AdaptorTemplate();``

3. Override the following methods, which are defined in
   ``adaptor-template.js``, based on the FooBar test framework:

   - ``start()``
   - ``getTestMessage()``
   - ``getTestName()``
   - ``getTestStatus()``
   - ``getTestStackTrace()``
   - ``getTotal()``
   - ``getTotalFailed()``
   - ``getTotalPassed()``
   - ``getTotalRuntime()``

Finally, define the configuration for FooBar in ``./config``:

::

    foobar: {
      includes: [
        'libraries/foobar.js',
        'adaptors/adaptor-template.js',
        'adaptors/foobar-.js'
      ]
    }

Now you can add the annotation ``@venus-library foobar`` at the
top of any JS unit test to use the FooBar test library with your tests.



