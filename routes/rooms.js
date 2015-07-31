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
    });
});

/* Delete room */
router.delete('/:room', function(req, res, next) {
    if(req.session.role !== 'planner'){
        res.status('401');
        return;
    }
    var room = req.params.room;
    usersMgr.deleteRoom(room, function(err){
        if(!err) {
            N.API.deleteRoom(room, function () {
                console.log('deleted room: '+room);
            }, function(err){
                console.error(err);
            });
            res.status('200').end();
        }else{
            next(err);
        }
    });

});

/* GET rooms */
router.get('/', function(req, res, next){
    switch (req.session.role){
        case undefined:
            res.status('401');
            break;
        case 'alumn':
            usersMgr.findAlummnRooms(req.session.nick, function (err, list) {
                if (err) return next(err);
                res.status('200').send({rooms: list});
            });
            break;
        case 'teacher':
            usersMgr.findTeacherRooms(req.session.nick, function (err, list) {
                if (err) return next(err);
                res.status('200').send({rooms: list});
            });
            break;
        case 'planner':
            usersMgr.findAllRooms(function (err, list) {
                if (err) return next(err);
                res.status('200').send({rooms: list});
            });
        default:
            res.status('500');
    }
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
