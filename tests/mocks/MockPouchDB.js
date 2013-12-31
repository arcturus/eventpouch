'use strict';

var MockPouchDB = {
  'storage': {},
  'get': function(name, key, cb) {
    if (key === null) {
      cb('Key is null', null);
      return;
    }
    if (!MockPouchDB.storage[name]) {
      cb('DB is null', null);
      return;
    }

    cb(null, MockPouchDB.storage[name][key]);
  },
  'put': function(name, obj, cb) {
    if (!obj._id) {
      cb('Invalid _id', null);
      return;
    }

    MockPouchDB.storage[name][obj._id] = obj;
    cb(null, obj);
  },
  'reset': function() {
    // Helper method to clean the dbs
    this.storage = {};
  }
};

function PouchDB(name) {
  if (!MockPouchDB.storage[name]) {
    MockPouchDB.storage[name] = {};
  }

  return {
    'name': name,
    'get': function(key, cb) {
      MockPouchDB.get(name, key, cb);
    },
    'put': function(obj, cb) {
      MockPouchDB.put(name, obj, cb);
    },
    get replicate() {
      var self = this;
      return {
        'to': function(pouch, callbacks) {
          var db = typeof pouch === 'string' ? pouch : pouch.name;
          var toDB = MockPouchDB.storage[db];
          if (!toDB) {
            MockPouchDB.storage[db] = {};
            toDB = MockPouchDB.storage[db];
          }
          var objs = MockPouchDB.storage[self.name];
          Object.keys(objs).forEach(function onKey(key) {
            toDB[key] = objs[key];
          });
          setTimeout(callbacks.complete, 0);
        }
      };
    },
    '_close': function() {

    },
    'destroy': function(name, cb) {
      delete MockPouchDB.storage[name];
      setTimeout(cb, 0);
    },
    'query': function(mapObj, options, cb) {
      var func = mapObj.map;
      global.currentId = '';
      var results = {
        'rows': []
      };
      function emit(key, object) {
        results.rows.push({
          'id': global.currentId,
          'key': key,
          'value': object
        });
      }
      global.emit = emit;
      var elements = MockPouchDB.storage[this.name];
      var self = this;
      Object.keys(elements).forEach(function onElement(key) {
        var elem = elements[key];
        global.currentId = elem._id;
        func.call(null, elem);
      });

      delete global.emit;
      delete global.currentId;
      setTimeout(function() {
        cb(null, results);
      }, 0);

    },
    'MockPouchDB': MockPouchDB
  };
}

module.exports = PouchDB;
