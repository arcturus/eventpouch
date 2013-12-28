/*global suite, assert, test, suiteSetup, suiteTeardown, window, setup*/
'use strict';

var env = require('../../src/eventpouch_env.js');
var jsdom = require('jsdom').jsdom;
var MockMozApps = require('../mocks/MockMozApps.js');

suite('environment detection', function() {

  test('unknown env', function(done) {
    env.getAppVersion(function onVersion(v) {
      assert.equal(v, 'unknown');
      done();
    });
  });

  test('env called twice', function(done) {
    env.getAppVersion(function onVersion(v) {
      env.getAppVersion(function onV2(w) {
        assert.equal(v, w);
        done();
      });
    });
  });

  suite('running in a mozapp', function() {
    var globalWindow = false;
    var realMozApps = null;
    var subject;
    suiteSetup(function() {
      if (typeof window === 'undefined') {
        var doc = jsdom('');
        global.window = doc.createWindow();
        global.window.navigator = {
          'mozApps': MockMozApps
        };
        subject = global.window.navigator.mozApps;

        globalWindow = true;
      } else {
        realMozApps = window.navigator.mozApps;
        window.navigator.mozApps = MockMozApps;
        subject = window.navigator.mozApps;
      }

      subject.selfManifest = {
        'version': '0.0.1'
      };

    });

    suiteTeardown(function() {
      if (globalWindow) {
        delete global.window;
      } else {
        window.navigator.mozApps = realMozApps;
      }
    });

    setup(function() {
      env.reset();
    });

    test('known version', function(done) {
      env.getAppVersion(function onVersion(v) {
        assert.equal(v, '0.0.1');
        done();
      });
    });

    test('unknown version', function(done) {
      var oldManifest = window.navigator.mozApps.selfManifest;
      window.navigator.mozApps.selfManifest = {};
      env.getAppVersion(function onUnknown(v) {
        assert.equal(v, 'unknown');
        window.navigator.mozApps.selfManifest = oldManifest;
        done();
      });
    });
  });
});
