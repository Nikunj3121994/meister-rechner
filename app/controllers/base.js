/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version');

// the index path - render the mustache template
exports.index = function(req, res){
  res.render('index');
};

// return the current version as plain/text
exports.version = function(req, res) {
	res.write(version.number);
	res.end();
};

// common error handle
exports.handleError = function( req, res, next, err ) {
  console.error('An error occured: ' + err.message);
  console.error('Stack: ' + err.stack);

  return next(err);
};

// return JSON and add headers to prevent caching
exports.jsonNoCache = function(res, object) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
  res.setHeader('Expires', 'Tue, 01 Jan 1991 16:00:00 GMT'); // Proxies.
  res.setHeader('Last-Modified', new Date().toGMTString());
  res.json(object);
};
