.. _getting_started:

***************
Getting started
***************

Install Venus.js
----------------

1. Install Node.js::
  Please see the instructions at `http://www.nodejs.org <http://www.nodejs.org>`_ for getting node.js running on your platform.

2. Install Venus.js via NPM::
  ``npm install -g venus``

3. Verify installation::
  ``venus demo``

Write your first test
---------------------

Venus.js designed to work with multiple testing libraries (see :doc:`reference/supported_libraries`).

In the directory of your choice, create a new file (lets call it example.js):


.. code-block:: javascript

  /**
   * @venus-library mocha
   */
  describe('First unit test using venus.js', function() {
    it('Gives us the ability to run test from the command line', function() {
      expect(2 + 2).to.be(4);
    });
  });


Run your first test
-------------------

``venus run -t example.js -e ghost``


Output should look similar to

::

  info:   Serving test: http://172.16.146.107:2013/venus-core/1
  info:   Venus server started at http://172.16.146.107:2013 and is serving 1 test suites

   PhantomJS/1.9.1 /home/smclaugh/example.js

     First unit test using venus.js
     --------------------------------------------------------
     ✓ Gives us the ability to run test from the command line


  --------------------------------------------------------
    1 tests executed in 899 ms
    1 ✓ tests passed
    0 x tests failed

Run tests in the browser
------------------------

You can also run tests with Venus manually in a browser. To do this, start Venus without the `-e` (environment) flag:

``venus run -t example.js``

::

  info:   Serving test: http://172.16.146.107:2013/venus-core/1
  info:   Venus server started at http://172.16.146.107:2013 and is serving 1 test suites

Next, open the first URL printed above in your browser of choice (note: the URL on your machine will be different). You should see a screen similar to this:

.. image:: images/venus_ui.png

Getting help
------------

Having issuse getting these examples to work? Check out the `Venus.js Google Group <https://groups.google.com/forum/#!forum/venusjs>`_.

