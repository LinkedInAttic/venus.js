.. _supported_libraries:

*******************
Supported Libraries
*******************

Venus.js is designed to work with multiple testing libraries. Out of the box, Venus.js supports:

* `Mocha <http://visionmedia.github.io/mocha/>`_
* `Jasmine <http://pivotal.github.io/jasmine/>`_
* `QUnit <http://qunitjs.com/>`_

When writing a test, use the `@venus-library` annotation to indicate which testing library you wish to use (see :doc:`annotations`).

Here is the same test written with Mocha, Jasmine, and QUnit.

-----
Mocha
-----

Mocha is unique in that you can use your choice of assertion libraries. By default, Venus ships with the `expect.js <https://github.com/LearnBoost/expect.js/blob/master/README.md>`_ assertion library for use with Mocha.

.. code-block:: javascript

  /**
   * @venus-library mocha
   * @venus-include ../src/Greeter.js
   */

  describe('Greeter', function () {

    it('.talk() should format string', function() {
      var greet  = new Greeter(),
          result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

      expect(result).to.be('Hello Seth, how are you doing this fine Thursday?');
    });

  });


-------
Jasmine
-------
.. code-block:: javascript

  /**
   * @venus-library jasmine
   * @venus-include ../src/Greeter.js
   */

  describe('Greeter', function () {

    it('.talk() should format string', function() {
      var greet  = new Greeter(),
          result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

      expect(result).toBe('Hello Seth, how are you doing this fine Thursday?');
    });

  });


-----
QUnit
-----
.. code-block:: javascript

  /**
   * @venus-library qunit
   * @venus-include ../src/Greeter.js
   */

  test('Greeter', function () {
    var greet  = new Greeter(),
        result = greet.talk('Hello %s, how are you doing this fine %s?', 'Seth', 'Thursday');

    equal(result, 'Hello Seth, how are you doing this fine Thursday?', 'Greeter.talk() formats the string correctly');
  });
