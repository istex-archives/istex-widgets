var httpServer    = require('http-server');
var Browser       = require('zombie');
var assert        = require('chai').assert;
var istexApiFaker = require('istex-api-faker');


describe('Istex results widget', function () {
  before(require('./lib/before.js'));

  // visit the search test page
  before(function (done) {
    this.browser.visit('/test/results.html', done);
  });

  it('should show have an input form with "query" value', function () {
    assert.ok(this.browser.success);
    assert.ok(this.browser.query('input.istex-search-input'));
    assert.equal(this.browser.query('input.istex-search-input').type, 'search');
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
    assert.isString(this.browser.text('ol.istex-results-items li:first-child a.istex-results-item-title'));
  });

  after(require('./lib/after.js'));
});