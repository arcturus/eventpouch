'use strict';

var MockConfigurator = {
  'config': {}
};

function Configurator(configObj, cb) {
  var DEFAULTS = {
    'remoteSyncHost': null,
    'syncAfter': 10,
    'appVersion': null,
    'db': 'configuration',
    'dbConfigKey': 'configuration',
    '_id': 'configuration'
  };
  Object.keys(DEFAULTS).forEach(function onParam(param) {
    MockConfigurator.config[param] = configObj[param] ||
     DEFAULTS[param];
  });

  setTimeout(function() {
    cb(MockConfigurator.config);
  }, 0);
}


module.exports = Configurator;
