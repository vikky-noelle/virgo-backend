const express = require('express');
const app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var db = require('./dbhandler.js');
// forgot password imports
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer')
// importing files
var post = require('./routes/post');
var get = require('./routes/get')


// configuring body parser for post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors error handling Correct way of removing cors
app.options('*', cors());
app.use(function(req, res, next) {
    res.header("Access_Control-Allow-Origin", "*");
    res.header("Access_Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// setting a default view engine
app.set('view engine', 'pug')
// post request handling
app.use('/post', post);
app.use('/get', get);



// error handlers
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

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

// assigning a port for the development
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening on port ${port}...`));