const http = require('http');

const requestListener = function (request, response) {

  var domainpath_handler_js_file_instance = require("./workaround.js");

  var request_response = domainpath_handler_js_file_instance.http_createServer_callback(request, response);
  request = request_response.request;
  response = request_response.response;

  if(!response.disable_auto_response){
    response.writeHead(200);
    response.end('Hello, World!');
  }
}

const server = http.createServer(requestListener);
server.listen(8080);