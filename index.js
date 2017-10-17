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
  console.log(publicDir);
  router.get(options.mountPath, testdraw());
  router.get('/open', open());
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
            console.log(expose_dir);
            //loopbackApplication.use('/static', express.static(__dirname + "/"+ uploadDir));
            loopbackApplication.use('/static', express.static(expose_dir));
            //loopbackApplication.use('/static', express.static(uploadDir));
}); 

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
  console.log('test draw');
  return  function(req, res) {
        console.log('write page');
        //res.send('<html><head></head><body class="vsc-initialized"><h1>Start here</h1></body></html>');
        //loopbackApplication.use(express.static(__dirname + '/public'));
        //res.sendFile(express.static(path.join(__dirname + '/public')));
        //app.use(express.static(__dirname + '/public'));
        res.sendFile(path.join(__dirname + '/public/index.html'));
    };
}
function open(res){
  return  function(req, res) {
        res.sendFile(path.join(__dirname + '/public/open.html'));
    };
}
function models_data(res){
    /*fs.readFile('index.js',function(err, data){
    });*/
    return  function(req, res) {
        //'../../server/boot/model-config.json'
        fs.readFile('server/model-config.json',"utf8",function(err, data){
            var config = JSON.parse(data);
            //config._meta.sources[2]
            fs.readdir("server/"+config._meta.sources[2],function(err, data){
                var filesPath = [];
                data.forEach(function(item, idx){
                    if(item.indexOf(".json")>0){
                        filesPath.push(item);
                    }
                });
                //var dirPath= "server/../common/models/";
                //console.log(dirPath);
                var dirPath= "server/"+config._meta.sources[2]+"/";
                //console.log(dirPath);
                //console.log(filesPath);
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
                        console.log(filesPath[idx]);
                        //resul[filesPath[idx]] = 
                        var temp_item = JSON.parse(item);
                        temp_item['file'] = filesPath[idx];
                        resul.push(temp_item);
                    })
                    //resul;
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
//C:\xampp\htdocs\MY\loopdraw\node_modules\loopdraw\public