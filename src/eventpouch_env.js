/*global window */
'use strict';

//
// Module that will try to extract information
// from the environment where eventpouch is running
//
var eventpouch_env = function() {

  var version = null;
  var UNKNOWN_VERSION = 'unknown';

  // Quick and dirty function to figure out
  // where are we running
  var detectEnv = function detectEnv() {
    if (typeof window !== 'undefined' && window.navigator.mozApps) {
      return 'mozApps';
    } else {
      return 'unkwon_os_yet';
    }
  };

  // Tries to return current app running
  var getAppVersion = function getAppVersion(cb) {
    if (version) {
      cb(version);
      return;
    }
    switch(detectEnv()) {
      case 'mozApps':
        getMozAppVersion(cb);
        break;
      default:
        getUnknowVersion(cb);
        break;
    }
  };

  // Kwoning that we are in a Mozilla environment
  // supported with webapps, returns the version
  var getMozAppVersion = function getMozAppVersion(cb) {
    var request = window.navigator.mozApps.getSelf();
    request.onsuccess = function(evt) {
      var app = evt.target.result;
      if (!app || !app.manifest || !app.manifest.version) {
        version = UNKNOWN_VERSION;
      } else {
        version = app.manifest.version;
      }

      cb(version);
    };
    request.onerror = function(evt) {
      version = UNKNOWN_VERSION;
      cb(version);
    };
  };

  var getUnknowVersion = function getUnknownVersion(cb) {
    version = UNKNOWN_VERSION;
    cb(version);
  };

  var reset = function reset() {
    version = null;
  };

  return {
    'getAppVersion': getAppVersion,
    'reset': reset
  };

}();

module.exports = eventpouch_env;
