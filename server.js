'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const baseDirectory = __dirname + "/src";

// Constants
const PORT = process.env.PORT || 8080;

// http.createServer(function (request, response) {
//    var requestUrl = url.parse(request.url)
//    response.writeHead(200)
//    fs.createReadStream(requestUrl.pathname).pipe(response)
// }).listen(PORT)

http.createServer(function (request, response) {
   try {
     var requestUrl = url.parse(request.url)

     // need to use path.normalize so people can't access directories underneath baseDirectory
     var fsPath = baseDirectory+path.normalize(requestUrl.pathname)

     if (fs.statSync(fsPath).isDirectory()) fsPath += 'index.html';
    console.log(fsPath);

     response.writeHead(200)
     var fileStream = fs.createReadStream(fsPath)
     fileStream.pipe(response)
     fileStream.on('error',function(e) {
         response.writeHead(404)     // assume the file doesn't exist
         response.end()
     })
   } catch(e) {
     response.writeHead(500)
     response.end()     // end the response so browsers don't hang
     console.log(e.stack)
   }
}).listen(PORT)

console.log("listening on http://localhost:"+PORT)
