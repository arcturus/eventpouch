'use strict';

var uuidGenerator = require('../../src/utils/uuid.js');

suite('UUID Generator', function() {

  test('generates a 32 bits uuid', function () {
    var uuid = uuidGenerator();
    assert.equal(uuid.length, 32 + 4); // 4 separartors '-'
  });

  test('differnt uuid generated', function() {
    var uuid1 = uuidGenerator();
    var uuid2 = uuidGenerator();

    assert.notEqual(uuid1, uuid2);
  });

});