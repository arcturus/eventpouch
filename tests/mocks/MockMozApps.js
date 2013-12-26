/*jslint -W078 */
'use strict';

var MockMozApps = function MockMozApps() {
  var selfManifest;

  var getSelf = function getSelf() {
    return {
      set onsuccess(cb) {
        setTimeout(function() {
          var evt = {
            target: {
              result: {
                manifest: selfManifest
              }
            }
          };
          cb(evt);
        }, 0);
      }
    };
  };

  return {
    get selfManifest() {
      return selfManifest;
    },
    set selfManifest(m) {
      selfManifest = m;
    },
    'getSelf': getSelf
  };
}();

module.exports = MockMozApps;
