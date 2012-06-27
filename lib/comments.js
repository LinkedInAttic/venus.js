/**
 * Parse JavaDoc style comments
 * @author LinkedIn
 */

/**
 * Parse string to comment objects
 */
function parse(str) {
  var blockRegex    = /\/\*([\s\S]*)\*\//g;
  var blockMatches;
  var blocks        = [];

  blockMatches = str.match(blockRegex);

  blockMatches.forEach(function(g) {
    blocks.push(parseBlock(g));
  });

  return blocks;
}

/**
 * Parse a comment block
 */
function parseBlock(block) {
  var paramRegex    = /@.*/g;
  var paramMatches;
  var params        = {};
  var param;

  paramMatches = block.match(paramRegex);

  paramMatches.forEach(function(p) {
    param = parseParam(p);
    if(!params[param.name]) {
      params[param.name] = [];
    }

    params[param.name].push(param.value);
  });

  return params;
}

/**
 * Parse a param
 */
function parseParam(param) {
  var kvRegex     = /@(.*)\s(.*)/;
  var kvMatches   = param.match(kvRegex);

  return {
    name:  kvMatches[1],
    value: kvMatches[2]
  };
}

module.exports.parse = parse;
Object.seal(module.exports);
