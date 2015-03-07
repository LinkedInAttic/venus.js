.. _config_files:

***************
Config files
***************

Overview:
===================
Venus searches for a file named 'config' in the '.venus' directory then proceeds to walk up the directory tree looking for other '.venus/config' files.

When multiple configs are encountered, the config files will extend one another from the order of the furthest config to the closest (closest config to cwd takes precedence).

What can be specified in `.venus/config`?
===================

libraries:
----------------
The libraries config object gives you a way to create a grouping of files that can be passed as an argument to @venus-library annotation for inclusion on the test harness.

Given the following directory structure:

::

  |-.venus/
    |-config
    |-adaptors/
      |-venus-mocha-1.12.0.js
    |-libraries/
      |-mocha-1.12.0.js
      |-expect.js
      |-sinon.js

Define a library inside the libraries object. The library should include an array called `includes` that contains an array of filepaths.

::

  // Example snippet from .venus/config

  {
    libraries: {
      mocha: {
        includes: [
          'libraries/mocha-1.12.0.js',
          'libraries/expect.js',
          'adaptors/adaptor-template.js',
          'adaptors/venus-mocha-1.12.0.js',
          'libraries/sinon.js'
        ]
      }
    },
    default: {},
    environments: {},
    includes: {},
    binaries: {}
  }

Notice that the library will be referenced by the key name (mocha) and anything specified within the "includes" array will be injected into the test harness page (see "@venus-library mocha" below):

::

  // Example file: test/unit/js/someScript.spec.js

  /**
   * @venus-library mocha
   * @venus-include ../../js/someScript.js
   */

   describe('My test', function() {
     it('should pass', function() {
       expect(true).to.be(true);
     });
   });

default:
----------------
The "default" option allows you to specify one of your libraries as the default library to be included, which frees you from using the @venus-library annotation as in the previous example.  It's useful if you are using the same test libraries across all of your suites/specs, or want to run a default environment.

::

  // Example snippet from .venus/config

  {
    default: {
      library: 'mocha',
      environment: 'ghost'
    }
    libraries: {
      mocha: {
        includes: [
          ...
        ]
      }
    },
    environments: {
      ghost: {
        ...
      }
    },
    basePaths: {},
    includes: {},
    binaries: {}
  }

In the above example, all of the test using this config would assume that you wanted to include the "mocha" library includes, and "ghost" as your default environment.

::

  /**
   * @venus-include ../../js/someScript.js
   */

   describe('My test', function() {
     it('should pass', function() {
       expect(true).to.be(true);
     });
   });

includes:
----------------
Similar to libraries, includes allow us to specify groups of files that can be included on the test harness page, by using the @venus-include annotation.

Specifying an include group can be done like so:

::

  // Example snippet from .venus/config
  {
    includes: {
      websockets: [
        '../../bower_components/sio-client/socket.io.js',
        '../../bower_components/jquery/jquery.min.js'
      ]
    },
    default: {},
    libraries: {},
    environments: {},
    basePaths: {},
    binaries: {}
  }

Using the created include can be done like so:

::

  /**
   * @venus-include websockets
   */
   describe('My test', function() {
     it('should pass', function() {
       expect(true).to.be(true);
     });
   });

environments:
----------------
In this config object, you can define custom environments (e.g. browsers) for use in the CLI.  The flag `--environment, -e` can be used to specify which environment you'd like to use.  Below are some commented example environment configurations.

::

  // Example snippet from .venus/config

  {
    environments: {

      // Run ie 7.0 on selenium webdriver
      sauce_ie_7: {
        uac: 'WebDriverUac',
        browser: 'internet explorer',
        version: '7.0',
        host: 'selenium.your-server.com',
        port: 4444
      },

      // Run chrome version 42 in sauce labs
      sauce_chrome_42: {
        uac: 'SauceLabsUac',
        host: 'ondemand.saucelabs.com',
        browser: 'chrome',
        version: 42,
        platform: 'OS X 10.9',
        username: 'my_saucelabs_user_name',
        accessKey: '1b0222b9-36ed-414d-865x-e4d14c8a45xf3'
      },

      // Run using a local phantom binary
      ghost: {
        uac: 'GhostDriverUac',
        binaryPath: ['../bin/phantomjs', '../node_modules/phantomjs/bin/phantomjs'],
        host: 'localhost',
        port: '8910'
      }
    },
    default: {},
    libraries: {},
    includes: {},
    basePaths: {},
    binaries: {}
  }

basePaths:
----------------
The `basePaths` object defines aliases that can be used within venus annotations for brevity/convenience:

::

  // Example snippet from .venus/config

  {
    basePaths: {
      appJs: '../../js'
    },
    default: {},
    libraries: {},
    includes: {},
    environments: {},
    binaries: {}
  }

The definition we created above "appJs" will be substituted with "../../js/" when venus looks for your test file:

::

  // The venus-include path below would resolve to "../../js/" before becoming an absolute path
  /**
   * @venus-include appJs/someScript.js
   */

   describe('My test', function() {
     it('should pass', function() {
       expect(true).to.be(true);
     });
   });


Working config example:
===================
`See a working config here on github <https://github.com/linkedin/venus.js/blob/2.x/.venus/config>`_.