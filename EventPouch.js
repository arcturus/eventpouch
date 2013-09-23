'use strict';

window.EventPouch = function EventPouch(connStr, tout, cb) {

  var defaultEvents = {
    'register': 'register',
    'start_session': 'start_session',
    'end_session': 'end_session',
    'error': 'error'
  };

  // Configuration values
  var remoteServer,
      timeout,
      uuid,
      version;

  var eventsDB,
      currentSession,
      originalOnBeforeUnload,
      originalOnError;

  var init = function init(connStr, tout, cb) {
    // Check that we have our dependencies loaded
    // Right now just check for PouchDB
    if (!PouchDB) {
      throw new Error('Missing PouchDB');
      return;
    }

    // Setup basic configuration
    if (!connStr) {
      throw new Error('Need a server to sync client data');
      return;
    }

    remoteServer = connStr;
    timeout = null;
    if (typeof tout == 'number') {
      timeout = parseInt(tout);
    }

    getConfiguration(function onConfiguration() {
      setBasicHandlers();
      startSession();
      // Launch sync
      if (timeout != null) {
        setTimeout(sync, timeout);
      }
    });
  };

  // Gets some of the configuration needed that was stored
  // locally, if doesnt exists, creates basic info.
  // We will store locally the following parameters:
  //    - App version, if present in the manifest (or unknonw)
  //    - UUID for an specific client
  var getConfiguration = function getConfiguration(cb) {
    var configDB = new PouchDB('config');

    configDB.get('master_params', function(err, config) {
      if (err || !config) {
        config = {};
        uuid = config.uuid = getUUID();
        getAppVersion(function onVersion(v) {
          version = config.version = v;
          config._id = 'master_params';

          // Save the result for next session
          configDB.put(config, function(err, response) {
            cb();
          });
        });
      } else {
        uuid = config.uuid;
        version = config.version;
        cb();
      }
    });
  };

  // Gets app version from manifest if present
  // string 'unknown' otherwise
  var getAppVersion = function getAppVersion(cb) {
    // Helper function
    function setUnknonwVersion() {
      cb('unknown');
    }

    // Get information from the manifest
    if (!navigator.mozApps) {
      setUnknonwVersion();
      return;
    }

    var request = navigator.mozApps.getSelf();
    request.onsuccess = function(evt) {
      var app = evt.target.result;
      if (!app || !app.manifest || !app.manifest.version) {
        setUnknonwVersion();
        return;
      }

      cb(app.manifest.version);
    };
    request.onerror = function(evt) {
      setUnknonwVersion();
    };
  };

  // Handles custom dom events launched under the
  // name 'EventPouch', we will look for the following
  // information in the event object:
  //  type: one of the default types or a custom by the user
  //  detail: payload for the event
  var eventListener = function eventListener(evt) {
    if (!evt.type || !evt.detail) {
      return;
    }

    logEvent(evt.type, evt.detail);
  };

  // Add default handlers for actions predefined like:
  //  onerror
  //  onbeforeunload
  // Also setup the handling of specific events for this
  // library
  var setBasicHandlers = function setBasicHandlers() {
    // Listen to loggeable events
    document.addEventListener('eventpouch', eventListener);

    originalOnError = window.onerror;
    originalOnBeforeUnload = window.onbeforeunload;

    window.onerror = function onError() {
      logEvent(defaultEvents.error, {}, originalOnError);
    };

    window.onbeforeunload = function onClose() {
      logEvent(defaultEvents.end_session, {}, originalOnBeforeUnload);
    };
  };

  var startSession = function startSession(cb) {
    currentSession = {
        'session_id': new Date(),
        'uuid': uuid,
        'version': version
    };

    eventsDB = new PouchDB('events');
    eventsDB.get(defaultEvents.register, function(err, value) {
      if (err || !value) {
        logEvent(defaultEvents.register, {});
      }
      logEvent(defaultEvents.start_session, {});

      if (cb) {
        cb();
      }
    });
  };

  // Utility function to get unique ids per client
  var getUUID = function getUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    };

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
  };

  // Saves an event of type (a string) with the json data
  // given by the payLoad parameter.
  var logEvent = function logEvent(type, payLoad, cb) {
    var now = new Date();
    var id = defaultEvents.register == type ?
      defaultEvents.register : String(type + '-' + now.getTime());
    var loggedEvent = {
      'type': type,
      'payLoad': payLoad,
      'session': currentSession,
      'date': now,
      '_id': id
    };

    eventsDB.put(loggedEvent, function(err, data) {
      // Don't do anything if fail
      if (cb) {
        cb();
      }
    });
  };

  var sync = function sync(cb) {
    if (!navigator.onLine) {
      if (cb) {
        cb();
      }
      return;
    }

    var onComplete = cb || null;
    eventsDB.replicate.to(remoteServer, {
      complete: onComplete
    });
  };

  init(connStr, tout, cb);

  return {
    'logEvent': logEvent
  };
};
