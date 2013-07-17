.. _command_line_flags:

***************
Command line flags
***************

venus run
----

Run tests specified as an argument to the -t or --test option. When this command is executed, venus will look for a `.venus` config file in the current directory or otherwise traverse upwards until one is found. If no config file is found you will recieve an error.

Options:
::

   -h, --help                 output usage information
   -t, --test [tests]         Comma separated string of tests to run
   -p, --port [port]          port to run on
   -l, --locale [locale]      Specify locale to use
   -v, --verbose              Run in verbose mode
   -d, --debug                Run in debug mode
   -c, --coverage             Generate Code Coverage Report
   --hostname [host]          Set hostname for test URLs, defaults to your ip address
   --no-annotations           Include test files with no Venus annotations (@venus-*)
   -e, --environment [env]    Specify environment to run tests in
   -r, --reporter [reporter]  Test reporter to use. Default is "DefaultReporter"
   -o, --output-file [path]   File to record test results
   -n, --phantom              Run with PhantomJS. This is a shortcut to --environment ghost

Basic format:
::

  venus run --test [path to folder containing tests or single test file] [options]

Usage (Run JavaScript tests found in a folder and its subfolders in phantomjs headless browser):
::

  venus run -t myproject/containing/tests --phantom

----------
venus init
----------

Generates a ``.venus`` project folder, with a boilerplate config file

Options:
::

  -h, --help             output usage information
  -l, --locale [locale]  Specify locale to use
  -v, --verbose          Run in verbose mode
  -d, --debug            Run in debug mode

Usage:
::

  venus init

Output:
::

  |-.venus/
    |-config
    |-adaptors/
    |-templates/
    |-libraries/

Boilerplate `.venus/config` file:

::

  // Configuration file for Venus
  // All paths can be relative (to the location of this config file) or absolute
  {
  }

venus demo
----

Runs an example venus test using Mocha and PhantomJS

Example: 

::

  venus demo
