.. environments:

***************
Test execution environments
***************

Local (Manual)
--------

You can run a unit test with any browser you have installed locally on your machine

Below is an example of running ``tests.js`` locally:

::

  $ venus run -t tests.js

PhantomJS
---------

PhantomJS is a headless browser that Venus leverages to seamlessly run unit tests

The command line option -n or --phantom will specify the test to run with PhantomJS

Below is an example of running ``tests.js`` with PhantomJS:

::

  $ venus run -t tests.js -n

This is a shortcut to the command:

::

  $ venus run -t tests.js -e ghost

The ``-e``,  or ``--environment`` flag specifies which test environment to use. For more information, see
configuring test environments below.

Selenium Grid
-------------

Using a Selenium Grid setup, you can request a VM with a given browser to execute a unit test via Venus. You can
configure different environments in your venus config file. Here is a sample config file setup to run tests remotely in
several popular browsers, through selenium grid:

.. code-block:: javascript

  environments: {
    ie7: {
      uac: 'WebDriverUac',
      browser: 'internet explorer',
      version: '7.0',
      host: 'selenium-0101.corp.net',
      port: 4444 
    },
    ie8: {
      uac: 'WebDriverUac',
      browser: 'internet explorer',
      version: '8.0',
      host: 'selenium-0101.corp.net',
      port: 4444 
    },
    ie9: {
      uac: 'WebDriverUac',
      browser: 'internet explorer',
      version: '9.0',
      host: 'selenium-0101.corp.net',
      port: 4444 
    }
  }

``WebDriverUac`` refers to a Venus User Agent Controller module which understands how
to communicate with a selenium grid server. The other options in each section are passed
along, to request a specific browser version for running tests.

If I hade a selenium grid server running at ``selenium-1010.corp.net:4444``, I could run this venus command
to execute tests on Internet Explorer 8:

::

  $  venus run -t tests.js -e ie8


Sauce Labs
-----------

`Sauce Labs <http://www.saucelabs.com>`_ is a great hosted solution for running your tests
on a wide variety of platforms. Venus provides a special UAC for running tests with Sauce Labs. You can set this up in your venus config file
by creating an environment like this:

.. code-block:: javascript

  environments: {
    sauce: {
      uac: 'SauceLabsUac',
      host: 'ondemand.saucelabs.com',
      browser: 'firefox',
      version: 20,
      platform: 'OS X 10.6',
      username: 'your_sauce_labs_username',
      accessKey: 'your_sauce_labs_access_key'
    }
  }

You would then run your tests through Sauce Labs with this command:

::

  $  venus run -t tests.js -e sauce
