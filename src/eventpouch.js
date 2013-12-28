/*globals window: true, PouchDB: true*/
'use strict';

var Configurator = require('./eventpouch_config.js');
var PouchDB = require('pouchdb');

var EventPouch = function EventPouch(configObj, cb, onSync) {

  var defaultEvents = {
    'register': 'register',
    'start_session': 'start_session',
    'end_session': 'end_session',
    'error': 'error'
  };

  var config;

  var sessionDB,
      historyDB,
      currentSession,
      originalOnBeforeUnload,
      originalOnError;

  var init = function init(configObj, cb, onSync) {

    PouchDB.DEBUG = true;

    ensureDBs();

    archiveCurrentSession(function onArchive() {
      new Configurator(configObj, function onConfig(cfg) {
        config = cfg;
        setBasicHandlers();
        startSession();
        // Launch sync
        if (config.remoteSyncHost) {
          setTimeout(function() {
            remoteSync(onSync);
          }, config.syncAfter * 1000); // Minutes
        } else {

        }

        if (typeof cb === 'function') {
          cb();
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

    window.onerror = function onError(errorMsg, url, lineNumber) {
      logEvent(defaultEvents.error, {
        'errorMsg': errorMsg,
        'url': url,
        'lineNumber': lineNumber
      }, originalOnError);
    };

    window.onbeforeunload = function onClose() {
      logEvent(defaultEvents.end_session, {}, originalOnBeforeUnload);
    };
  };

  var ensureDBs = function ensureDBs() {
    sessionDB = new PouchDB('session');
    historyDB = new PouchDB('history');
  };

  // Start to record a new session, each time we lauch,
  // event pouch from a cold start.
  // That session will be used in all events logged,
  // until a new session is created.
  var startSession = function startSession(cb) {
    currentSession = {
        'session_id': new Date(),
        'uuid': config.uuid,
        'version': config.version
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

  // Copy current content of history db to
  // a remote CouchDB previously configured
  var remoteSync = function remoteSync(cb) {
    // TODO: Register for online events to retry.
    if (!window.navigator.onLine) {
      if (cb) {
        cb();
      }
      return;
    }

    var onComplete = cb || null;
    historyDB.replicate.to(config.remoteSyncHost, {
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

  init(configObj, cb, onSync);

  return {
    'logEvent': logEvent,
    'clearLocalData': clearLocalData
  };
};

module.exports = EventPouch;
