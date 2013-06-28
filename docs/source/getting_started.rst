.. _getting_started:

***************
Getting started
***************

Install Venus.js
----------------

1. Install Node.js::
  ``brew install node``

2. Install PhantomJS::
  ``brew install phantomjs``

3. Install Venus via NPM::
  ``npm install -g venus``

4. Verify installation::
  ``venus demo``

Write your first test
---------------------

In the directory of your choice, create a new file (lets call it example.js)

Contents of example.js::

  describe('First unit test using venus.js', function() {
    it('Gives us the ability to run test from the command line', function() {
      expect(2 + 2).to.be(4);
    });
  });

Save the file

Run your first test
-------------------

``venus run -t example.js --phantom``

Output should look similar to::

  PhantomJS

     First unit test using venus.js
       ✓ Gives us the ability to run test from the command line

  ✓ 1 test completed (0.01ms)


General overview
----------------

The example above uses mocha as its test runer and expect as its assertion library.  That combination of libraries are what Venus.js ships with "out of the box".

If you prefer other test runners, Venus.js also support, qunit, and jasmine while giving you the ability to extend support to more libraries by tailoring your own custom-adaptor template.

As far as assertion libraries go, you can choose whatever you'd like by making a simple config change.

