window._jsModules = {};

function define(moduleName, moduleValue) {
  window._jsModules[moduleName] = moduleValue();
}

function require(moduleValues, callback) {
  var resolvedmoduleValues = moduleValues.map(function (moduleValue) {
    return window._jsModules[moduleValue];
  });

  callback.apply(null, resolvedmoduleValues);
}

