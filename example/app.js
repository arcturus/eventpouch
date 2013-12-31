'use strict';

var eventpouch = require('eventpouch');

var app = function app() {

  var eventLogger;

  var init = function init() {
    // New logger with no external sync
    eventLogger = new eventpouch(null, function() {
      dumpContent();
    });
    var buttons = Array.prototype.slice.call(document.getElementsByTagName('button'));
    buttons.forEach(function onBtn(button) {
      button.addEventListener('click', handleEvent);
    });
  };

  var handleEvent = function handleEvent(evt) {
    switch (evt.target.id) {
      case 'customEvent':
        eventLogger.logEvent('myCustomEvent', {
          date: new Date()
        });
      break;
      case 'forceJSError':
        // Force a stupid error
        var x = document.querySelector('xxx');
        console.log(x.parent.classList);
      break;
      case 'dumpContent':
        dumpContent();
      break;
    }
  };

  var dumpContent = function dumpContent() {
    console.log('Dumping content');
  };

  return {
    'init': init
  };

}();

app.init();