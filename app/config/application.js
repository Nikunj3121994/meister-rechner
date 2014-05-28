/*
 * application configuration file
 */
var version = require('./version');

var config = {};

// set the application version
config.version = version;

config.application = {};
config.application.basePath = '/';
config.application.secret = 'Adkflksez387ndsdlfls';

// specify if error stack-trace should be displayed
// config.errorDetails = 'error-stack';
config.errorDetails = 'error-stack';

module.exports = config;
