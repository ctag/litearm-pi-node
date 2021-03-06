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

var servoState = []; // current servo position
var servoNext = []; // desired servo position
var servoMap = ['P1-11','P1-13','P1-15'];
var moveServosTimeout; // timeout id
var timeoutDelay = 10; // timeout delay
var moveStep = 2; // timeout servo movement step

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

function moveServos()
{
  //console.log("moveServos");
  var equalCount = 0;
  for (var i = 0; i < servoMap.length; i++) {
    var servo = servoMap[i];
    if ((servoState[i]+moveStep) < servoNext[i]) {
      servoState[i] = servoState[i] + moveStep;
    } else if ((servoState[i]-moveStep) > servoNext[i]) {
      servoState[i] = servoState[i] - moveStep;
    } else if (servoState[i] < servoNext[i]) {
      servoState[i]++;
    } else if (servoState[i] > servoNext[i]) {
      servoState[i]--;
    } else {
      equalCount++;
    }
    console.log("Moving "+servo+" to "+servoState[i]);
    exec('echo '+servo+'='+servoState[i]+' > /dev/servoblaster');
  }
  if (equalCount != 3) {
    moveServosTimeout = setTimeout(moveServos, timeoutDelay);
  }
}

function setServo(servo, val)
{
  console.log("set servo: ", servo, " -> ", val);
  servoNext[servo] = val;
  clearTimeout(moveServosTimeout);
  moveServosTimeout = setTimeout(moveServos, timeoutDelay);
}

exec('echo P1-11='+150+' > /dev/servoblaster');
exec('echo P1-13='+150+' > /dev/servoblaster');
exec('echo P1-15='+150+' > /dev/servoblaster');
servoState[0] = 150;
servoState[1] = 150;
servoState[2] = 150;

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/digits.html'));
});

app.get('/cmd', function(req, res, next) {
  if (!req.query.cmd) {
    console.log("no command");
    return;
  }
  if (req.query.cmd === 'set servo') {
    console.log("Setting servo "+req.query.servo+" to val "+req.query.val);
    setServo(req.query.servo, req.query.val);
    res.json({ res: 1 });
  } else if (req.query.cmd === 'get servo' && req.query.servo) {
    console.log("Returning servo "+req.query.servo+" val "+servoState[req.query.servo]);
    res.json({ res: servoState[req.query.servo] });
  } else {
    console.log("/cmd problem");
    res.json({ res: -1 });
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
