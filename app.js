/**
 * LiteArm-i2 controller
 * Christopher Bero [csb0019@uah.edu]
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fork = childProcess.fork;
var exec = childProcess.exec;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var fs = require('fs');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

var servoState = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

function setServo(servo, val)
{
  if (typeof(servo) !== 'number') {
    return;
  } else if (typeof(val) !== 'number') {
    return;
  }
  exec('echo '+servo+'='+val+' > /dev/servoblaster',
  function (error, stdout, stderr) {
    console.log("set servo: ", servo, " -> ", val);
    servoState[servo] = val;
  });
}

setServo(1, 150);
setServo(3, 150);
setServo(4, 150);

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/digits.html'));
});

app.get('/cmd', function(req, res, next) {
  if (!req.query.cmd) {
    console.log("no command");
    return;
  }
  if (req.query.cmd === 'set servo' &&
  typeof(req.query.servo) === 'number' &&
  typeof(req.query.val) === 'number') {
    console.log("Setting servo "+req.query.servo+" to val "+req.query.val);
    setServo(req.query.servo, req.query.val);
    res.json({ res: 1 });
  } else if (req.query.cmd === 'get servo' && req.query.servo) {
    console.log("Returning servo "+req.query.servo+" val "+servoState[req.query.servo]);
    res.json({ res: servoState[req.query.servo] });
  } else {
    console.log("/cmd problem");
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
