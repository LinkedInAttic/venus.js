'use strict';

module.exports = {
  /**
   * Return a string with given indentation (spaces) and a max length
   * @param {string} str String to format
   * @param {number} indent Number of spaces to indent
   * @param {number} width Length of final string (including indentation)
   * @returns {string}
   */
  fmt: function (str, indent, width) {
    var indentStr = new Array(indent + 1).join(' ');
    var widthStr  = new Array(width + 1).join(' ');
    var result    = [indentStr, str, widthStr];

    return result.join('').slice(0, width);
  }
};
