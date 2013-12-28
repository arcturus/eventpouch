/*global suite, assert, test, suiteSetup, suiteTeardown, window, setup, teardown*/
'use strict';

var jsdom = require('jsdom').jsdom;
var proxyquire = require('proxyquire').noCallThru();
var MockConfigurator = require('../mocks/MockConfigurator.js');
var MockPouchDB = require('../mocks/MockPouchDB.js');

var path = require('path');
var sourcePath = path.resolve('./src');
var moduleToLoad = sourcePath + '/./eventpouch_config.js';

var proxyquireParams = {};
proxyquireParams[moduleToLoad] = MockConfigurator;
proxyquireParams.pouchdb = MockPouchDB;

var eventpouch = proxyquire('../../src/eventpouch.js', proxyquireParams);
var sinon = require('sinon');

suite('eventpouch', function() {

  var mockConfig, mockPouch, mockStorage;
  var globalWindow = false;
  var subject = null;
  var doc;

  suiteSetup(function(done) {
    new MockConfigurator({}, function onConfig(cfg) {
      mockConfig = cfg;

      if (typeof window === 'undefined') {
        doc = jsdom('');
        global.window = doc.createWindow();
        globalWindow = true;
      }

      mockPouch = new MockPouchDB('');
      MockPouchDB.destroy = function(name, cb) {
        mockPouch.destroy(name, cb);
      };
      done();
    });
  });

  suiteTeardown(function() {
    if (globalWindow) {
      delete global.window;
    }
  });

  setup(function(done) {
    mockStorage = mockPouch.MockPouchDB.storage;
    subject = new eventpouch({}, done);
  });

  teardown(function() {
    mockPouch.MockPouchDB.reset();
  });

  test('simple initialisation', function() {
    assert.isTrue(mockStorage.session !== undefined);
    assert.isTrue(mockStorage.history !== undefined);
  });

  test('register exists', function() {
    var register = mockStorage.session.register;
    assert.isNotNull(register);
    assert.equal('register', register._id);
    assert.lengthOf(Object.keys(mockStorage.history), 0);
    assert.lengthOf(Object.keys(mockStorage.session), 2);
    var countStart = 0;
    var startSession = null;
    Object.keys(mockStorage.session).forEach(function onLog(key) {
      var evt = mockStorage.session[key];
      if (evt.type === 'start_session') {
        assert.isTrue(evt._id.indexOf('start_session') === 0);
        countStart++;
        startSession = evt;
      }
    });
    assert.isTrue(countStart == 1);
    assert.isNotNull(startSession);
  });

  test('log custom event', function(done) {
    subject.logEvent('myCustomEvent', {'payload': 1}, function() {
      var session = mockStorage.session;
      assert.isNotNull(session);
      var myCustomEvent = null;
      var numEvents = 0;
      Object.keys(session).forEach(function onKey(key) {
        var evt = session[key];
        if (evt.type === 'myCustomEvent') {
          numEvents++;
          myCustomEvent = evt;
        }
      });
      assert.equal(numEvents, 1);
      assert.isNotNull(myCustomEvent);
      assert.isNotNull(myCustomEvent.payload);
      assert.isNotNull(myCustomEvent.session);
      assert.isNotNull(myCustomEvent.date);
      assert.isNotNull(myCustomEvent._id);
      assert.deepEqual({'payload': 1}, myCustomEvent.payLoad);
      done();
    });
  });

  test('clean local data', function(done) {
    subject.clearLocalData(function() {
      assert.deepEqual(mockStorage, {});
      done();
    });
  });

  test('remote sync', function(done) {
    var realOnline = window.navigator.onLine;
    window.navigator.onLine = true;
    var evtp = new eventpouch({'remoteSyncHost': 'remoteDB',
      'syncAfter': 0.0001}, null, function() {
        window.navigator.onLine = realOnline;
        assert.deepEqual(mockStorage.history, mockStorage.remoteDB);
        done();
      }
    );
  });
});
