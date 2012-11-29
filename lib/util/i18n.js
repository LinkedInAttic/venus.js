// @author LinkedIn     

// Define i18n locales    

var i18n = require('i18n');

// Define locales and directory for translations  
i18n.configure({
  locales:  ['en', 'pirate'],
  directory: __dirname + '/../../locales'
});

// Set default locale  
i18n.setLocale('pirate');

module.exports = i18n.__;
Object.seal(module.exports);