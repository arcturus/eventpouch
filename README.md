eventpouch
==========

Simple analytics tool for HTML5 web apps.

With the onmipresent idea of _offline first_, eventpouch is a javascript library that will help developers to know how their app is behaving, by keeping track of how the app is used and possible javascript errors.

Developers need to know how users are interacting with their application, to check if new features are having a good impact, also knowing if the app is generating unexpected javascript errors is key to provide users with regular updates.

offline first
---
eventpouch has been built in top of [PouchDB] and [CouchDB] working in the following way:

  - All events registered will be stored in 2 local PouchDB databases:
      - session: where the events happening in a current session are stored.
      - history: containing all previous session events.
  - The information could be sync to a remote CouchDB database
      - when configuring eventpouch we can setup the _history_ database to be sync with an external CouchDB instance.

What is logged?
---
By default eventpouch will store the following information:
   - _register_ even: will happen just once, first time is used and will create a json object containing app version (can be specified in the configuration, Firefox OS is supported so eventpouch can get the version automatically), and random generated uuid.
   - start session event: each time eventpouch is initialised a new event containing a session identifier.
   - end session event: eventpouch will record when a document is unloaded. For single document webapps this is usually when the app is closed.
   - javascript errors: any uncaught javascript error will be stored containing the line and javascript file that generated the error.

Also each developer can decide what to log, eventpouch provides a function to add custom events with the desired payload (in json format). An example of this:
```sh
logger.logEvent('redButtonPressed', {currentValue: 1});
```

Getting eventpouch
----
During eventpouch build process all the dependencies needed are downloaded and dispatched, that's the case of PouchDB, which version used is downloaded and bundled into a single file.

To get the latest version just:
```sh
git clone https://github.com/arcturus/eventpouch
cd eventpouch
npm install
grunt
```
This will create the following file:
```sh
./dist/eventpouch-<version>.min.js
```
ready to be used in your projects.

Using eventpouch
---
**Without external sync**
```javascript
var eventpouch = require('eventpouch');

var logger = new eventpouch({}, function onReady() {
    // Optional
    // Initalised and start session event already recorded
});
...
logger.logEvent('redButtonPressed');
```

**With external sync**
```javascript
var eventpouch = require('eventpouch');

var logger = new eventpouch({
    'remoteSyncHost': 'https://mycouchdbdomain.com/mydb',
    // Sync after X seconds to avoid several ops at once
    'syncAfter': 5,
    // Optional, if not present will be inferred
    'appVersion': '1.0.3'
}, function onReady() {
    // Optional
}, function onSyncDone() {
    // Optional, callback called once the sync between
    // current history db and external CouchDB happened.
});
```
When syncing remotely, CouchDB must be configured to accept [CORS request], a good practice here is to setup an unique allowed origin, your web app origin.

Example
---
You can find a simple webapp example on the code (folder `example`), just run
```sh
grunt open-example
```
This example will allow you to generate events to be logged and dump the content of the local databases to check what's saved.

Build status
----
[![Status](https://secure.travis-ci.org/arcturus/eventpouch.png?branch=master)](http://travis-ci.org/arcturus/eventpouch)

TODO
----
Now we need to create a CouchDB app, that will be visualising the information that we sync from the client. Next project to be announced :)


License
----

Apache 2.0 (see LICENSE)

[PouchDB]:http://pouchdb.com/
[Dale Harvey]:https://twitter.com/daleharvey
[CouchDB]:http://couchdb.apache.org/
[cors request]:http://wiki.apache.org/couchdb/CORS



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/arcturus/eventpouch/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

