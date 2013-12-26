'use strict';

var MockPouchDB = {
  'storage': {},
  'db': '',
  'get': function(key, cb) {
      if (key === null) {
      cb('Key is null', null);
      return;
    }

    cb(null, MockPouchDB.storage[key]);
  },
  'put': function(obj, cb) {
    if (!obj._id) {
      cb('Invalid _id', null);
      return;
    }

    MockPouchDB.storage[obj._id] = obj;
    cb(null, obj);
  }
};

function PouchDB(name) {
  MockPouchDB.db = name;

  return MockPouchDB;
}

module.exports = PouchDB;
