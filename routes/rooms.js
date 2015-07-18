var express = require('express');
var N = require('../lib/external/nuve');
var router = express.Router();

/* Create room */
router.post('/', function(req, res, next){
    N.API.createRoom('meeting', function(room) {
        console.log('Created room ', room._id);
        res.status('201').send(room._id).end();
    });
}, function (err){
    next(err)
});

/* GET all rooms */
router.get('/', function(req, res, next){
    N.API.getRooms(function(roomList){
        res.status('200').send(roomList).end();
    });
}, function (err){
    next(err)
});

/* Create token for joining room */
router.post('/:room/createToken/', function(req, res, next) {
    var room = req.params.room;
    N.API.createToken(room, 'user', 'presenter', function(token) {
        req.session.token = token;
        res.status('201').send(token).end();
    });
}, function (err){
    next(err)
});


module.exports = router;
