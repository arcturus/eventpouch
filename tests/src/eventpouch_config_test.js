/*global suite, assert, test, suiteSetup, suiteTeardown, window, setup, teardown*/
'use strict';

var proxyquire =  require('proxyquire');
var MockPouchDB = require('../mocks/MockPouchDB.js');
var Configurator = proxyquire('../../src/eventpouch_config.js', {
  'pouchdb': MockPouchDB
});
var sinon = require('sinon');

suite('eventpouch config', function() {

  var getSpy, putSpy;
  var mockConf;

  suiteSetup(function() {
    mockConf = new MockPouchDB('');
    getSpy = sinon.spy(mockConf.MockPouchDB, 'get');
    putSpy = sinon.spy(mockConf.MockPouchDB, 'put');
  });

  setup(function() {
    getSpy.reset();
    putSpy.reset();
  });

  teardown(function() {
    mockConf.MockPouchDB.storage = {};
  });

  test('Simple config', function(done) {
    new Configurator({}, function(config) {
      assert.isTrue(getSpy.called);
      assert.isTrue(putSpy.called);

      assert.isNull(config.remoteSyncHost);
      assert.equal('10', config.syncAfter);
      assert.equal('configuration', config.db);
      assert.equal('configuration', config.dbConfigKey);
      assert.equal('unknown', config.appVersion);
      assert.isTrue(config.uuid.length == (32 + 4));

      assert.equal(config, mockConf.MockPouchDB.storage.configuration.configuration);

      done();
    });
  });

  test('Config already on db', function(done) {
    new Configurator({'appVersion': '1.0.0'}, function(cfg1) {
      assert.isTrue(getSpy.called);
      assert.isTrue(putSpy.called);

      new Configurator(cfg1, function(cfg2) {
        assert.deepEqual(cfg1, cfg2);
        assert.equal(cfg2.appVersion, '1.0.0');
        mockConf.MockPouchDB.storage = {};
        done();
      });
    });
  });
});
