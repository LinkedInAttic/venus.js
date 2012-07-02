/**
 * File system helpers
 * @author LinkedIn
 */
var fs     = require('fs'),
    i18n   = require('./i18n'),
    logger = require('./logger');

/**
 * Search a specified folder, and all parent folders, for
 * a venus config directory
 * @param {String} path the starting path
 * @param {String} target the file or directory name
 */
function searchUpwardsForFile (path, target) {
  var checkPath = path + '/' + target,
      split     = path.split('/'),
      parent    = split.slice(0, -1).join('/');

  if(path.length === 0) {
    path = '/';
  }

  logger.info( i18n('Looking for %s in %s', target, path) );

  if(fs.existsSync(checkPath)) {
    return checkPath;
  } else if(split.length > 1) {
    return searchUpwardsForFile(parent, target);
  } else {
    return false;
  }
};

module.exports.searchUpwardsForFile = searchUpwardsForFile;
