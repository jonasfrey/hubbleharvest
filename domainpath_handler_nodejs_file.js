module.exports = {
    http_createServer_callback: function(request, response) {
        response.writeHead(302, {
            'Location': 'https://hubbleharvest.ch:8080'
            //add other headers here...
          });
          response.end();
        return {
            request: request,
            response: response
        }
    }
}