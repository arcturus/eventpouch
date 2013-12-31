'use strict';

var eventpouch = require('eventpouch');

var app = function app() {

  var eventLogger;
  var dumpArea;

  var init = function init() {
    dumpArea = document.getElementById('dump');
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

  // From: http://stackoverflow.com/questions/4810841/json-pretty-print-using-javascript
  function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  var dumpContent = function dumpContent() {
    eventLogger.dump(function(err, data) {
      if (err) {
        dumpArea.textContent = 'Error : ' + err; 
      } else {
        dumpArea.innerHTML = syntaxHighlight(data);
      }
    });
  };

  return {
    'init': init
  };

}();

app.init();