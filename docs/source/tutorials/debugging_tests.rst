.. _debugging_tests:

***************
Debugging failing tests
***************

Sometimes tests will give you a useful message explaining why they
failed, but there are other times where they fail or hang without
providing a clue of what is going on.

When you are having this issue the best way to debug the issue is to
open the test in your favorite browser.

.. image:: images/debugging/image1.png

There is more happening on the browser than what we see at first glance.
If you take a look at the DOM you will see an iframe with a src
attribute something like /venus-core/sandbox/1, and this is where all
the action happens. In there you can see all the libraries being loaded
for your test, the file you are testing and the test code.

.. image:: images/debugging/image2.png

If you don't see your script files being loaded, this is a good
indicator that something is wrong with your test. This is an example of
how the iframe looked on one test were I was triggering a redirect and
by doing that breaking my tests:

.. image:: images/debugging/image3.png

Knowing this is also useful to find out why a test is failing or
something is not working as expected. Since you now have access to your
JS files from your developer tools you can set break points and go
through the code step by step to figure out why something is failing.

.. image:: images/debugging/image4.png