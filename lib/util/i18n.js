var i18n = require('i18n');

i18n.configure({
  locales:  ['en', 'pirate'],
  directory: __dirname + '/../../locales'
});

i18n.setLocale('pirate');

module.exports = i18n.__;
Object.seal(module.exports);
