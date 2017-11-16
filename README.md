# LoopDraw

A visual diagram interface for loopback backend works with 2.x and 3.x 


## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

npm install --save-dev loopdraw

Add this code to your **server/server.js**
´´´
var loopdraw = require('loopdraw');

...

app.start = function() {
  // start the web server
  return app.listen(function() {
    ...
    if (app.get('loopdraw')) {
      var explorerPath = app.get('loopdraw').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
    ...
  }
  ´´´
Add this code to your **server/component-config.json**
´´´
  "loopdraw": {
    "mountPath": "/diagram"
  }
´´´

## Usage

It will run along with the loopback server so:

´´´ node . ´´´
or 
´´´ slc run ´´´

And then go to : 

http://localhost:3000/diagram

## Tests

  `npm test`

## License

Licensed for use under the MIT License (MIT). Please see LICENSE for more information.