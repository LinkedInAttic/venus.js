// argParser.js
module.exports = function (argv) {
  var output = {
    ignored: []
  };

  argv.forEach(function (item) {
    parseKeyValuePair(item, output);
  });

  return output;
};

function parseKeyValuePair(item, output) {
  var regKeyValuePair, match, key, value;

  regKeyValuePair = /--(\w*)+=?([\w|\\|\/|:|\.|\-]*)?/;
  match = item.match(regKeyValuePair);

  if (match) {
    key = match[1];
    value = match[2] || true;
    output[key] = value;
  } else {
    output.ignored.push(item);
  }
}
