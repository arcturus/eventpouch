'use strict';

// Simple UUID generator
var UUIDGenerator = function UUIDGenerator() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

module.exports = UUIDGenerator;
