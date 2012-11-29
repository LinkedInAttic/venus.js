// @author LinkedIn     

// String utility helpers

// Indicates if the given string contains HTML  
function hasHtml(str) {
  // str is considered to have HTML if there's a '<' followed by a '>'
  // somewhere later in the string
  var pattern = /<([A-Z][A-Z0-9]*)\b[^>]*>/i;
  return pattern.test(str);
};

module.exports.hasHtml = hasHtml;
Object.seal(module.exports);