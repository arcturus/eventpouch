/*globals window: true, PouchDB: true*/
'use strict';

var getUUID = require('./utils/uuid.js');
var Configurator = require('./eventpouch_config.js');

var EventPouch = function EventPouch(connStr, tout, cb) {

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

  var sessionDB,
      historyDB,
      currentSession,
      originalOnBeforeUnload,
      originalOnError;

  var init = function init(connStr, tout, cb) {

    PouchDB.DEBUG = true;

    // Setup basic configuration
    if (!connStr) {
      throw new Error('Need a server to sync client data');
    }

    remoteServer = connStr;
    timeout = null;
    if (typeof tout == 'number') {
      timeout = parseInt(tout, 10);
    }

    ensureDBs();

    archiveCurrentSession(function onArchive() {
      new Configurator(function onConfig(config) {
        setBasicHandlers();
        startSession();
        // Launch sync
        if (config.remoteSyncHost) {
          setTimeout(sync, config.syncAfter * 1000); // Minutes
        }
      });
    });
  };

  // Saves the current session data into the history data
  // emptying the current session db.
  var archiveCurrentSession = function archiveCurrentSession(cb) {
    if (!sessionDB || !historyDB) {
      if (typeof cb === 'function') {
        cb();
      }
      return;
    }

    sessionDB.replicate.to(historyDB, {'complete': function onComplete() {
        // Clear current session DB
        resetDB('session', function onReset() {
          if (typeof cb === 'function') {
            cb();
          }
        });
      }
    });
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
    window.document.addEventListener('eventpouch', eventListener);

    originalOnError = window.onerror;
    originalOnBeforeUnload = window.onbeforeunload;

    window.onerror = function onError() {
      logEvent(defaultEvents.error, {}, originalOnError);
    };

    window.onbeforeunload = function onClose() {
      logEvent(defaultEvents.end_session, {}, originalOnBeforeUnload);
    };
  };

  var ensureDBs = function ensureDBs() {
    //if (sessionDB === null) {
      sessionDB = new PouchDB('session');
    //}
    //if (historyDB === null) {
      historyDB = new PouchDB('history');
    //}
  };

  var startSession = function startSession(cb) {
    currentSession = {
        'session_id': new Date(),
        'uuid': uuid,
        'version': version
    };

    ensureDBs();

    historyDB.get(defaultEvents.register, function(err, value) {
      if (err || !value) {
        logEvent(defaultEvents.register, {});
      }
      logEvent(defaultEvents.start_session, {});

      if (cb) {
        cb();
      }
    });
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

    if (sessionDB === null) {
      sessionDB = new PouchDB('session');
    }

    sessionDB.put(loggedEvent, function(err, data) {
      // Don't do anything if fail
      if (cb) {
        cb();
      }
    });
  };

  // Clears information in db, so far by destroying
  // it :S
  var resetDB = function resetDB(dbName, cb) {
    PouchDB.destroy(dbName, function onDestroy(err, info) {
      if (dbName === 'session') {
        sessionDB._close();
        sessionDB = null;
      } else {
        historyDB._close();
        historyDB = null;
      }

      if (typeof cb === 'function') {
        cb();
      }
    });

  };

  var sync = function sync(cb) {
    if (!window.navigator.onLine) {
      if (cb) {
        cb();
      }
      return;
    }

    if (historyDB === null) {
      historyDB = new PouchDB('history');
    }

    var onComplete = cb || null;
    historyDB.replicate.to(remoteServer, {
      complete: onComplete
    });
  };

  var clearLocalData = function clearLocalData(cb) {
    PouchDB.destroy('config', function onConfigDone() {
      PouchDB.destroy('session', function onSessionDone() {
        PouchDB.destroy('history', function onHistoryDone() {
          if (typeof cb === 'function') {
            cb();
          }
        });
      });
    });
  };

  init(connStr, tout, cb);

  return {
    'logEvent': logEvent,
    'clearLocalData': clearLocalData
  };
};

module.exports = EventPouch;