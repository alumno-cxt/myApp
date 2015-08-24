/**
 * Created by alex on 23/08/15.
 */
var config = require('../app_config');
var express = require('express');

var app = express();

app.use(redirectAll);

function redirectAll(req, res){
    res.redirect(config.hostname + ':' + config.https_port + req.url);
}

module.exports = app;