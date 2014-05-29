/*
 * define the routes to the handling controllers
 * index.js created by Henrik Binggl
 */
'use strict';

var baseController = require('../controllers/base');
var calcController = require('../controllers/calculation');
var API = require('../config/version').api;

// setup the routes and delegate logic to the controllers 
// --------------------------------------------------------------------------
exports.setup = function(app) {
  //app.get('/', baseController.index);

  app.get('/api/' + API + '/version', baseController.version);
  app.get('/api/' + API + '/calculation/:level', calcController.newCalculation);
};
