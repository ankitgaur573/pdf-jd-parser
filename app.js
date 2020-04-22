var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

// ================================

// var mongoose = require('mongoose');
// var mongo = process.env.mongo;
// var connection = mongoose.createConnection(mongo, { useNewUrlParser: true });
// mongoose.set('ossConnection', connection);
// ossConnection.on('connected', console.error.bind(console, 'OSS Mongo Connected'));
// ossConnection.on('error', console.error.bind(console, 'OSS Mongo Connection Error'));

var app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));




// controllers
var ttsRouter = require('./routes/tts');
var indexRouter = require('./routes/index')

app.use('/', indexRouter);
app.use('/tts', ttsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  var message = err.message ? err.message : "Something went wrong";
  var body = {
    "message": message
  }
  
  res.send(body);
});

module.exports = app;
