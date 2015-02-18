var httpServer = require('http-server');
var Browser    = require('zombie');
var assert     = require('chai').assert;

describe('Istex search widget', function () {
  before(require('./lib/before.js'));

  // visit the search test page
  before(function (done) {
    this.browser.visit('/test/search.html', done);
  });

  it('should show an input query form', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('input.istex-search-input'));
    assert.equal(this.browser.query('input.istex-search-input').type, 'search');
  });

  it('should show a "Search" button', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('input.istex-search-submit'));
    assert.equal(this.browser.query('input.istex-search-submit').type, 'submit');    
  });

  it('should receive data when the query is submitted', function (done) {
    var self = this;
    assert.ok(self.browser.success);
    self.browser.fill('input.istex-search-input', 'brain');
    self.browser.pressButton('Rechercher').then(function () {
      assert.ok(self.browser.success);
      assert.include(self.browser.text('#istex-results-in-dom'), '"total":');
    }).then(done, done);
  });
  
  after(require('./lib/after.js'));
});