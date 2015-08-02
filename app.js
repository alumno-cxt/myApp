var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var rooms = require('./routes/rooms');

var nuve = require('./lib/external/nuve');

//licode configure
var config = require('../../licode/licode_config');
nuve.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');


var app = express();

var memStore = session.MemoryStore;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: 'mf82akq90e83l0q978nqllq191pe4n2ieh',
    store: memStore({reapInterval: 60000 * 10}), resave: false, saveUninitialized: true}));
app.use(express.static(path.join(__dirname, 'public')));

//Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/rooms', rooms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development'){
    app.use(function(err, req, res, next) {
        console.error(err);
        res.status(err.status || 500);
        res.send({message: err.message, error: err });
    });
}

// production error handler
// no stacktraces leaked to user
/*app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({message: err.message, error: {} });
});*/


module.exports = app;
