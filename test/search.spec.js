var httpServer = require('http-server');
var Browser    = require('zombie');
var assert     = require('assert');

describe('Istex search widget', function () {
  before(function (done) {
    var self = this;
    self.server = httpServer.createServer({
      root: __dirname + '/../'
    });
    self.server.listen(3000, '127.0.0.1', function () {
      self.browser = new Browser({ site: 'http://127.0.0.1:3000' });
      self.browser.silent = true;
      done();
    });
  });

  // visit the search test page
  before(function (done) {
    this.browser.visit('/test/search.html', done);
  });

  it('should show an input query form', function () {
    assert.ok(this.browser.success);
    assert.equal(this.browser.text('h1'), "istexSearch test");

    // todo ... ajouter tests sur l'élément input inséré par le widget
    
  });

  it('should show a "Search" button');
  it('should receive data when the query is submitted');
  
  after(function () {
    this.server.close();
  });
});