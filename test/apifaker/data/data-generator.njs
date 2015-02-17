#!/usr/bin/env node

/**
 * Script used to harvest few ISTEX API documents
 * in order to be able to simulate a fake API locally
 */

'use strict';

// list of URL to harvest
var urls    = require('./urls-to-fake.js');

// load libraries dependencies
var request = require('superagent');
var async   = require('async');
var fs      = require('fs');
var url     = require('url');
var nconf   = require('nconf');
nconf.argv().env()
  .file('local', __dirname + '/config.local.json')
  .defaults({
    username: 'chuck.norris@inist.fr',
    password: 'xxx'
  });
var config = nconf.get();

// download every ressources
async.each(urls, function (reqData, cb) {
  reqData.url = url.format(reqData);
  console.log('Downloading ' + reqData.url)
  console.log('            to ' + reqData.filename)
  // execute the HTTP GET request
  request
    .get(reqData.url)
    .auth(config.username, config.password)
    .end(function (res) {
      fs.writeFile(reqData.filename, JSON.stringify(res.body), cb);
    });
}, function (err) {
  if (err) console.error(err);
  console.log('Downloading completed.')
});


