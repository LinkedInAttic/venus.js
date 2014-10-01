var nconf = require('nconf');
var path  = require('path');

function one() {
  return new nconf.Provider({
    env: true,
    argv: true,
    store: {
      type: 'file',
      file: '.venusrc',
      dir: path.resolve(__dirname, 'test', 'fixtures', 'projects', 'project_a'),
      search: true
    }}).defaults({
      age: 99
  });
}

function two() {
  return new nconf.Provider({
    env: true,
    argv: true,
    store: {
      type: 'file',
      file: '.venusrc',
      dir: path.resolve(__dirname, '.venusrc'),
      search: true
    }
  });
}

var a = one();
var b = two();

console.log('one.get("name") =', a.get('name'));
console.log('two.get("name") =', typeof b.get('name'));
console.log('one.get("name") =', a.get('age'));
console.log('one.get("name") =', b.get('age'));
