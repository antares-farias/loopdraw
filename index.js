// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopdraw
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var _defaults = require('lodash').defaults;
var express = require("express");
var path = require("path");
var fs = require('fs'), async = require('async');
var formidable = require('formidable');


module.exports = diagram;

function diagram(loopbackApplication, options) {
  options = _defaults({}, options, { mountPath: '/diagram' });
  var router = loopbackApplication.loopback.Router();
  var publicDir = path.join(__dirname + '/public');
  router.get(options.mountPath, testdraw());
  //router.get('/open', open());
  router.get('/models_data', models_data());
  router.get(publicDir, testdraw());
  //loopbackApplication.use('/diagram', express.static(expose_dir));

  router.post('/upload',upload());
  

  loopbackApplication.set('loopdraw', options);
  loopbackApplication.use('/', express.static(publicDir));
  fs.readFile('server/model-config.json',"utf8",function(err, data){
            var config = JSON.parse(data);
            var uploadDir = "../"+config._meta.sources[2]+'/diagram';
            var expose_dir = __dirname+"/"+uploadDir;
           // if (fs.existsSync(expose_dir)) {
                // Do something
                //loopbackApplication.use('/static', express.static(__dirname + "/"+ uploadDir));
                loopbackApplication.use('/static', express.static(expose_dir));
                //loopbackApplication.use('/static', express.static(uploadDir));
                loopbackApplication.get('/static/*',function(req, res) {
                    res.send('false');
                });
            /*}
            else{
            }*/
}); 
/*loopbackApplication.use(function(req, res) {
        res.status(404).render('false');
});*/

  loopbackApplication.use(router);

}
function upload(res){
    return function(req, res){
        fs.readFile('server/model-config.json',"utf8",function(err, data){
            var config = JSON.parse(data);
        // create an incoming form object
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;
        //res.writeHead(200, {'content-type': 'text'});

        // store all uploads in the /uploads directory
        //form.uploadDir = path.join(__dirname, '/uploads');
        form.uploadDir = "server/"+config._meta.sources[2]+'/diagram';
        if (!fs.existsSync(form.uploadDir)) {
            fs.mkdirSync(form.uploadDir, "0744");
        }

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function(field, file) {
            //console.log(file);
            /*console.log(file);
            console.log(form);
            console.log(field);
            console.log('tree left');
            console.log(this.uploadDir);
            console.log(form.uploadDir);
            console.log(file.path);
            console.log(file.name);
            */
            //TODO does noe recieve aneme
            fs.rename(file.path, path.join(form.uploadDir, "ER_Model.xml"));
        });

        // log any errors that occur
        form.on('error', function(err) {
            console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function() {
            res.end('success');
        });

        // parse the incoming request containing the form data
        form.parse(req);
    });
    };
}
function testdraw(res){
  return  function(req, res) {
        //res.send('<html><head></head><body class="vsc-initialized"><h1>Start here</h1></body></html>');
        //loopbackApplication.use(express.static(__dirname + '/public'));
        //res.sendFile(express.static(path.join(__dirname + '/public')));
        //app.use(express.static(__dirname + '/public'));
        res.sendFile(path.join(__dirname + '/public/index.html'));
    };
}
function sum(a,b){
    return a+b;
}
function open(res){
  return  function(req, res) {
        res.sendFile(path.join(__dirname + '/public/open.html'));
    };
}
function models_data(res){
    const uuidv4 = require('uuid/v4');
    const MY_NAMESPACE = uuidv4();
    // Generate a couple namespace uuids 
    const uuidv5 = require('uuid/v5');
    return  function(req, res) {
        //'../../server/boot/model-config.json'
        fs.readFile('server/model-config.json',"utf8",function(err, data){
            var config = JSON.parse(data);
            fs.readdir("server/"+config._meta.sources[2],function(err, data){
                var filesPath = [];
                data.forEach(function(item, idx){
                    if(item.indexOf(".json")>0){
                        filesPath.push(item);
                    }
                });
                //var dirPath= "server/../common/models/";
                var dirPath= "server/"+config._meta.sources[2]+"/";
                var filesPath2 = filesPath.map(function(filePath){ //generating paths to file
                    return dirPath + filePath;
                });
                //console.log(filesPath2);
                async.map(filesPath2, function(filePath, cb){ //reading files or dir
                    //console.log('reading :'+filePath);
                    fs.readFile(filePath, 'utf8', cb);
                }, function(err, results) {
                    //console.log(results); //this is state when all files are completely read

                    var resul = [{'saved_dir':"server/"+config._meta.sources[2]+'/diagram'}];
                    //console.log(filesPath);
                    results.forEach(function (item, idx){
                        var temp_item = JSON.parse(item);
                        if(!temp_item.ld_id){
                            temp_item.ld_id = uuidv5(filesPath[idx], MY_NAMESPACE);
                        }
                        //Serialize as JSON and Write it to a file
                        fs.writeFileSync("server/"+config._meta.sources[2]+'/'+filesPath[idx], JSON.stringify(temp_item, null, 2));
                        temp_item['file'] = filesPath[idx];
                        resul.push(temp_item);
                        //change the value in the in-memory object
                    })
                    res.send(resul); //sending all data to client
                });
                /*fs.readFile('server/../commondel-config.json',"utf8",function(err, data){

                });*/
                /*res.send({
                    data:json_array
                });*/
            })
        });
    };
}