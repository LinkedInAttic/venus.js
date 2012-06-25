var i18n = require('i18n');

i18n.configure({
  locales:  ['en', 'pirate']
});

i18n.setLocale('en');

module.exports = i18n.__;
