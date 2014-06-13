/*jslint node: true */

/**
 * Module dependencies.
 */
'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var winston = require('winston');
var FileStore = require('connect-session-file');
var routes = require('./app/routes');
var config = require('./app/config/application');
var env = process.env.NODE_ENV || 'development';

var app = express();

// --------------------------------------------------------------------------
// Application setup
// --------------------------------------------------------------------------

function customHeaders( req, res, next ){
  // Switch off the default 'X-Powered-By: Express' header
  app.disable( 'X-Powered-By' );
  // OR set your own header here
  res.setHeader( 'X-Powered-By', 'meister-rechner ' + config.version.number);
  next();
}

app.configure(function(){
  app.set('view engine', 'jade');

  app.set('port', process.env.PORT || 3000);
  app.set('host', '127.0.0.1');
  app.set('views', __dirname + '/app/views');
  
  app.use(express.favicon());
  // do some header mangling
  app.use(customHeaders);

  // Logging
  // Use winston on production
  // and default express.logger on dev
  var log;
  if (env !== 'development') {
    winston.add(winston.transports.File, { filename: '/var/log/node/meister-rechner-app.log' });
    winston.remove(winston.transports.Console);
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message);
        }
      }
    };
  } else {
    log = 'dev';
  }
  // Don't log during tests
  if (env !== 'test') {
    app.use(express.logger(log));
  }

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(require('connect-multiparty')());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.application.secret));
  app.use(express.session());

  app.use(express.session({
    secret: config.application.secret,
    store: new FileStore({path: path.join(__dirname, 'session'), printDebug: false, useAsync: true})
  }));

  app.use(app.router);

  if(!env || env === 'development') {
    app.use(express.static(path.join(__dirname, 'public/webapp')));
  } else if(env === 'production') {
    // New call to compress content
    app.use(express.compress());
    app.use(express.static(path.join(__dirname, 'public/webapp/dist'), { maxAge: 1296000 } ));
  }

});

app.locals.basePath = config.application.basePath;

// --------------------------------------------------------------------------
// error handling
// --------------------------------------------------------------------------

// the following snippets of code was found here:
// http://runnable.com/UTlPPV-f2W1TAAEf/custom-error-pages-in-express-for-node-js

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.enable(config.errorDetails);

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.status(err.status || 500);
  res.render('500', { error: err });
});

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function(req, res, next){
  res.status(404);
  
  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});




// --------------------------------------------------------------------------
// routes
// --------------------------------------------------------------------------

routes.setup(app);


// --------------------------------------------------------------------------
// Development specific stuff
// --------------------------------------------------------------------------

// development specific stuff
app.configure('development', function () {
  app.locals.pretty = true;

  app.use(express.errorHandler());

  // test the custom error page
  app.get('/500', function(req, res, next){
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
  });

  // test a 404 response
  app.get('/404', function(req, res, next){
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
  });

});

// production is behind a proxy
app.configure('production', function () {
  app.enable('trust proxy');
});


// --------------------------------------------------------------------------
// finally the HTTP server
// --------------------------------------------------------------------------

http.createServer(app).listen(app.get('port'), app.get('host'),  function(){
  console.log('node.js is run in mode ' + env);
  console.log('Express server listening on port ' + app.get('port'));
});
