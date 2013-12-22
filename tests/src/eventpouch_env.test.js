/*global suite, assert, test*/
'use strict';

var env = require('../../src/eventpouch_env.js');

suite('environment detection', function() {

  test('unknown env', function(done) {
    env.getAppVersion(function onVersion(v) {
      assert.equal(v, 'unknown');
      done();
    });
  });
});
