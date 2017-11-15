# LoopDraw

A visual diagram interface for loopback backend works with 2.x and 3.x 


## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

npm install --save-dev loopdraw

Add this code to your server.js
´var loopdraw = require('loopdraw');

var app = module.exports = loopback();
..
app.start = function() {
  // start the web server
  return app.listen(function() {
    ...
    if (app.get('loopdraw')) {
      var explorerPath = app.get('loopdraw').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
    ...
  }´
## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests

  `npm test`

## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)