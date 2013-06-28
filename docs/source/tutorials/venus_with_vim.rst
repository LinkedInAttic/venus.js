.. _venus_with_vim:

***************
VIM Integration
***************

The `venus.vim <https://github.com/venusjs/venus.vim>`_ vim plugin allows you to easily run tests without leaving your editor. Supported commands:

* ``:VenusRun`` -- run current file in Venus.js in the PhantomJS environment

We recommend using a nice VIM package manager, such as `vundle <https://github.com/gmarik/vundle>`_, to manage your vim plugins. It is also helpful to map the ``:VenusRun`` command to a
shortcut key, such as ``F12``. You can do this in your ``.vimrc`` very easily::

  map <F12> :VenusRun<CR>

