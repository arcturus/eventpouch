'use strict';

var PouchDB = require('pouchdb');
var getUUID = require('./utils/uuid.js');
var evenpouch_env = require('./eventpouch_env.js');

var Configurator = function Configurator(configObj) {
  this._configKey = 'configuration';
  // CouchDB remote host for syncing
  this.remoteSyncHost = configObj.remote || null;
  // Try to perform the syn after X seconds
  this.syncAfter = configObj.syncAfter || 10;
  // Manually app version
  this.appVersion = configObj.appVersion || null;
};

// Utility method to know if we need to sync externally
Configurator.prototype.remoteSyncEnabled = function() {
  return this.remoteSyncHost !== null;
};

// Helper method that returns the parameters in
// a simple object.
Configurator.prototype._getConfig = function() {
  return {
    'remoteSyncHost': this.remoteSyncHost,
    'syncAfter': this.syncAfter,
    'appVersion': this.appVersion,
    'uuid': this.uuid,
    '_id': this._configKey
  };
};

// Saves current configuration
Configurator.prototype._saveConfig = function(cb) {
  var config = this._getConfig();

  var configDB = new PouchDB('config');
  configDB.put(config, function(err, response) {
    cb(configDB);
  });
};

// Load the config from the database
Configurator.prototype.loadConfiguration = function(cb) {
  if (this.config) {
    if (typeof cb === 'function') {
      cb(this.config);
    }
    return;
  }

  var configDB = new PouchDB('config');
  var self = this;
  configDB.get(this._configKey, function(err, config) {
    if (err || !config) {
      // We don't have a configuration stored
      // create a new one and save it
      self.uuid = getUUID();
      if (!self.appVersion) {
        evenpouch_env.getAppVersion(function onVersion(v) {
          this.appVersion = v;
          self._saveConfig(cb);
        });
      } else {
        if (typeof cb === 'function') {
          cb(self._getConfig());
        }
      }
    } else {
      Object.keys(config).forEach(function onKey(k) {
        this[k] = config[k];
      });
      if (typeof cb === 'function') {
        cb(config);
      }
    }
  });
};

module.exports = Configurator;
