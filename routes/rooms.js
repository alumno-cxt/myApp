var express = require('express');
var N = require('../lib/external/nuve');
var usersMgr = require('../lib/usersManager');
var router = express.Router();

/* Create room */
router.post('/', function(req, res, next) {
    if(req.session.role !== 'planner'){
        res.status('401');
        return;
    }
    N.API.createRoom(req.body.room_name, function (room) {
        var data = {room_name: req.body.room_name, teacher: req.body.teacher,
            alumns: req.body.alumns ,licode_room: room._id}
        usersMgr.createRoom(data, function(err){
            if(err){
                N.API.deleteRoom(room._id, function(){
                    console.log('deleted');
                });
                next(err);
            }else{
                res.status('201').end();
            }
        });
    }, function (err) {
        console.log(err);
        next(err)
    }, {p2p: true});
});

/* GET all rooms */
router.get('/', function(req, res, next){
    if(req.session.role === undefined){
        res.status('401');
        return;
    }
    N.API.getRooms(function(roomList){
        res.status('200').send(roomList).end();
    }, function (err){
        next(err)
    });
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
