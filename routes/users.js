var express = require('express');
var usersMgr = require('../lib/usersManager');
var router = express.Router();

/* ADD user. */
router.post('/', function(req, res, next){
    if(req.session.role === 'admin'){
        usersMgr.register(req.body, function(err){
            if(!err){
                res.status('201').end();
            }else{
                next(err);
            }
        });
    }else{
        //Unauthorized
        res.status('401').end();
    }
});

/* UPDATE user */
router.put('/:nick', function(req, res, next){
    if(req.session.nick == undefined){
        res.status('401').end();
    }else {
        var data = {};
        var v = false;
        if (req.body.email != req.session.email) {
            data.email = req.body.email;
            v = true;
        }
        if (req.body.pass != '') {
            data.pass = req.body.pass;
            v = true;
        }
        if (v === false) {
            res.status('200').end()
        } else {
            console.log(data);
            usersMgr.updateUser(req.session.nick, data, function (err) {
                if (!err) {
                    if (req.body.email != '' && req.body.email != undefined) req.session.email = req.body.email;
                    res.status('200').end();
                } else {
                    next(err);
                }
            });
        }
    }
});

/* GET users */
router.get('/', function(req, res, next){
    if(req.session.role === 'planner') {
        usersMgr.findByNameAndRole(req.query.pattern, req.query.role, function(err, list){
            if(!err){
                console.log(list);
                res.status('200').send(list).end();
            }else{
                next(err);
            }
        });
    }else{
        //Unauthorized
        res.status('401').end();
    }
});

/* Check user exists */
router.get('/:nick', function(req, res, next){
    if(req.params.nick === 'self'){
        res.status('200').send({
            nick: req.session.nick,
            email: req.session.email,
            role: req.session.role
        }).end();
    }else {
        if (req.session.role === 'planner') {
            if (req.query.role === 'teacher') {
                usersMgr.isTeacher(req.params.nick, '', function (err) {
                    if (!err) {
                        res.status('404').end();
                    } else {
                        if (err.status == 404) {
                            next(err);
                        } else {
                            res.status('200').end();
                        }
                    }
                });
            }
            if (req.query.role === 'alumn') {
                usersMgr.isAlumn(req.params.nick, '', function (err) {
                    if (!err) {
                        res.status('404').end();
                    } else {
                        if (err.status == 404) {
                            next(err);
                        } else {
                            res.status('200').end();
                        }
                    }
                });
            }
        } else {
            //Unauthorized
            res.status('401').end();
        }
    }
});

module.exports = router;
