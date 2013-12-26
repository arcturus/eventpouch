/*global suite, assert, test, suiteSetup, suiteTeardown, window, setup*/
'use strict';

var proxyquire =  require('proxyquire');
var MockPouchDB = require('../mocks/MockPouchDB.js');
//var Configurator = require('../../src/eventpouch_config.js');
var Configurator = proxyquire('../../src/eventpouch_config.js', {
  'pouchdb': MockPouchDB
});
var sinon = require('sinon');

suite('eventpouch config', function() {

  var getSpy, putSpy;
  var mockConf;

  suiteSetup(function() {
    mockConf = new MockPouchDB('');
    getSpy = sinon.spy(mockConf, 'get');
    putSpy = sinon.spy(mockConf, 'put');
  });

  setup(function() {
    mockConf.storage = {};
    mockConf.db = '';
    getSpy.reset();
    putSpy.reset();
  });

  test('Simple config', function(done) {
    new Configurator({}, function(config) {
      assert.isTrue(getSpy.called);
      assert.isTrue(putSpy.called);

      assert.isFalse(config.remoteSyncEnabled);
      assert.equal('10', config.syncAfter);
      assert.equal('configuration', config.db);
      assert.equal('configuration', config.dbConfigKey);
      assert.equal('unknown', config.appVersion);
      assert.isTrue(config.uuid.length == (32 + 4));

      assert.equal(mockConf.db, 'configuration');
      assert.equal(config, mockConf.storage.configuration);

      done();
    });
  });

  test('Confing already on db', function(done) {
    new Configurator({'appVersion': '1.0.0'}, function(cfg1) {
      assert.isTrue(getSpy.called);
      assert.isTrue(putSpy.called);

      new Configurator(cfg1, function(cfg2) {
        assert.deepEqual(cfg1, cfg2);
        assert.equal(cfg2.appVersion, '1.0.0');
        done();
      });
    });
  });
});
