var httpServer = require('http-server');
var Browser    = require('zombie');
var assert     = require('chai').assert;

describe('Istex results widget', function () {
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
    this.browser.visit('/test/results.html', done);
  });

  it('should show have an input form with "query" value', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('input.istex-search-input'));
    assert.equal(this.browser.query('input.istex-search-input').type, 'text');
    assert.equal(this.browser.query('input.istex-search-input').value, 'brain');
  });

  it('should have a statistic box in the page', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('div.istex-results-items-stats'));
  });

  it('should have a result list in the page', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('ol.istex-results-items'));
  });

  it('should have a result list with at least one element in the page', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('ol.istex-results-items li:first-child'));
  });

  it('should have results containing data', function () {
    assert.ok(this.browser.success);
    assert.equal(
      this.browser.text('ol.istex-results-items li:first-child a.istex-results-item-title'),
      'Biomechanical Simulation of Electrode Migration for Deep Brain Stimulation'
    );
  });

  after(function () {
    this.server.close();
  });
});