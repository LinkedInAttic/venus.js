'use strict';

var fs = require('fs');
var q  = require('q');

module.exports = {
  /**
   * Parse @venus-* annotations from file
   * @param {string} p - Absolute path to file to parse
   * @return {promise} key/value object
   */
  parse: function (p) {
    var def = q.defer();

    fs.readFile(p, {encoding: 'utf8'}, function (err, text) {
      if (err) {
        def.reject(err);
      } else {
        def.resolve(this.getAnnotations(text));
      }
    }.bind(this));

    return def.promise;
  },

  /**
   * Find annotations in string of text
   * @param {string} str - Content to look in
   * @return {object}
   */
  getAnnotations: function (str) {
    var match, regex, result;

    result = {};
    regex  = /@(venus-)?([\w|-]*)\s*([\w|\/|\\|\*|\.]*)/ig;

    do {
      match = regex.exec(str);
      if (match) {
        this.addMatch(match, result);
      }
    } while (match);

    return result;
  },

  /**
   * Add onnotation to list
   * @param {array} match from parse regex
   * @param {object} result object
   */
  addMatch: function (match, result) {
    var key = this.camel(match[2].toLowerCase());

    result[key] = result[key] || [];
    result[key].push(match[3]);

  },

  /**
   * Camel case a string
   * @method camel
   * @param {string} input
   */
  camel: function (input) {
    return input.replace(/-(\w)/g, function (match) {
      return match[1].toUpperCase();
    });
  }
};
