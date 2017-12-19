# LoopDraw

A visual diagram interface for loopback backend works with 2.x and 3.x 


## Installation

````sh
$ npm install --save-dev loopdraw
````

Add this code to your **server/server.js**

```javascript
var loopdraw = require('loopdraw');

...

app.start = function() {
  // start the web server
  return app.listen(function() {
    ...
    if (app.get('loopdraw')) {
      var explorerPath = app.get('loopdraw').mountPath;
      console.log('Browse your diagram at %s%s', baseUrl, explorerPath);
    }
    ...
  }
```
Add this code to your **server/component-config.json**
```javascript
  "loopdraw": {
    "mountPath": "/diagram"
  }
```

## Usage

It will run along with the loopback server so:

````sh
$ node .
````
or 
````sh
$ slc run
````

And then go to : 
````
http://localhost:3000/diagram
````

### Commands
Save : This will save and XML in ```<models_folder>/diagram/ER_Model.xml```
````
  [Ctrl+Shift+S] File->Save XML on Server
````
    
Rebuild : This will Detele the current Diagram and reaload it from JSON
````
[Ctrl+Shift+1] File->Reload From JSON
````

<b>[Experimental]</b> Update : This will Update the models that update from JSON without altering the styling
````
[Ctrl+Shift+2] File->Update From JSON
````

<b>[Experimental]</b> Update : This will update the JSON files with the model info
````
[Ctrl+Shift+3] File->Update Models
````

## Tests
````sh
$ npm test
````
## License

Licensed for use under the MIT License (MIT). Please see LICENSE for more information.

##Release 0.4.0

- Update JSON file
- Update SideBar
- Start Log/Message Panel

##Release 0.3.5

- Remove extra sectons on Menu
- Remove Extra Tools on Tool Bar
- Update Help
- Update About
- Update Hotkeys actions
- Fix reload issue