var express = require('express'),
    app = express(),
    appConfig = require('./config/appConfig'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    jsonwebtoken = require('jsonwebtoken'),
    logger = require('morgan');

/**
 * Logging
 */
app.use(logger('dev'));

/**
 * Top Level Parser Settings
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


/**
 * Set user to Decoded JWT user on every request
 */
app.use(function (req, res, next) {
  
});

console.log(appConfig.name);
var db = require('./api/mySql');

/**
* Routing
*/
// Set layer /api of requests using api
var api = require('./api/apiRouter');
app.use('/api', api);


/**
* Serve Static Files
*/
app.use(express.static('build'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;