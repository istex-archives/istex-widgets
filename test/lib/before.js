var httpServer    = require('http-server');
var Browser       = require('zombie');
var istexApiFaker = require('istex-api-faker');
//var istexApiFaker = require('../../../istex-api-faker/app.js');


module.exports = function (done) {
  var self = this;
  self.istexWidgetsServer = httpServer.createServer({
    root: __dirname + '/../../'
  });
  self.istexWidgetsServer.listen(3000, '127.0.0.1', function () {
    self.browser = new Browser({
      site: 'http://127.0.0.1:3000',
      userAgent: 'zombiejs',
    });
    //self.browser.silent = true;
    self.istexApiFakerServer = istexApiFaker.listen(35001, done);
  });
};