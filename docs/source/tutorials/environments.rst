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

Selenium Grid
-------------

Using Selenium, you can request a VM with a given browser to execute a unit test via Venus

The command line option -s or --selenium will specify the test to run with Selenium

Below is an example of running ``tests.js`` on a selenium grid hosted on example.selenium.com:

::

  $ venus run -t tests.js -s example.selenium.com

Command line options:

- -s, --selenium [server url]          
- --browser [browser|version]     

Sauce Labs
-----------

Venus provides Sauce Labs integration so that you can run your tests remotely on their browser farms

The command line option --sauce-labs will specify the test to run with Sauce Labs

Run the following command to run your tests with Sauce Labs:

::

  $ venus run -t tests.js --sauce-labs

Below is an example of running ``tests.js`` on a Sauce Labs with Firefox 20:

::

  $ venus run -t tests.js --sauce-labs --browser "Firefox|20"

Command line options:

- --sauce-labs [server url]
- --browser [browser|version]    
- --platform [platform]    
- --username [username]    
- --access-key [accessKey]    