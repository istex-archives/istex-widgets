/**
 * Istex API faker web server
 * (used by unit tests: gulp test)
 *
 * to use it, data folder has to be initialized
 * data/data-generator.njs script has to be called
 * to initialize the data folder
 *
 * then the web server listen on http://127.0.0.1:3000/
 * and can be used instead of the Istex API.
 * Ex: http://127.0.0.1:3000/document/?q=*
 */

// list of URL to fake
var urls    = require('./data/urls-to-fake.js');

var express = require('express');
var app     = express();
var _       = require('lodash');
var fs      = require('fs');

app.get('*', function (req, res) {
  
  // Catch every GET HTTP request
  // and thy to find if a fake url in the list 
  // match the current request.
  // if it doesn't match, just return 404
  var urlFound = false;
  urls.forEach(function (item) {
    if (item.pathname == req.path && _.isEqual(item.query, req.query)) {
      // build the filepath and check if available
      var filepath = __dirname + '/data/' + item.filename;
      if (!fs.existsSync(filepath)) return;
      // return the file content as JSON data
      urlFound = true;
      res.sendFile(filepath, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  });

  // if nothing is found, return 404
  if (!urlFound) {
    res.sendStatus(404);
  }

});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Istex API faker listening at http://%s:%s', host, port)
});