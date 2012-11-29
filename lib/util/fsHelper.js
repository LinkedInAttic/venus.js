// @author LinkedIn     

// File system helpers  

var fs     = require('fs'),
    i18n   = require('./i18n'),
    pathm  = require('path'),
    logger = require('./logger');

// Search a specified folder, and all parent folders, for a venus config directory  
function searchUpwardsForFile (path, target, multi, results) {
  var checkPath = path + '/' + target,
      split     = path.split('/'),
      parent    = split.slice(0, -1).join('/'),
      results   = results || [];

  if(path.length === 0) {
    path = '/';
  }

  logger.debug( i18n('Looking for %s in %s', target, path) );

  if(fs.existsSync(checkPath)) {
    results.push(pathm.resolve(checkPath));
  }

  if(path.length === 1) {
    return results;
  } else if(multi) {
    return searchUpwardsForFile(parent, target, multi, results);
  } else {
    return results;
  }
};

module.exports.searchUpwardsForFile = searchUpwardsForFile;
Object.seal(module.exports);
