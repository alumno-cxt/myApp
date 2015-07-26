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
router.put('/', function(req, res, next){
    usersMgr.updateUser(req.body, function(err){
        if(!err){
            res.status('303').end();
        }else{
            next(err);
        }
    });
});

/* GET users */
router.get('/', function(req, res, next){
    if(req.session.role === 'planner') {
        usersMgr.findByNameAndRole(req.query.pattern, req.query.role, function(err, list){
            if(!err){
                console.log(list);
                res.status('201').send(list).end();
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
router.get('/:user', function(req, res, next){
    if(req.session.role === 'planner') {
        if(req.query.role === 'teacher') {
            usersMgr.isTeacher(req.query.nick, req.query.role, function (err) {
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
        if(req.query.role === 'alumn') {
            usersMgr.isAlumn(req.query.nick, req.query.role, function (err) {
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
        res.status('404').end();
    }else{
        //Unauthorized
        res.status('401').end();
    }
});

module.exports = router;
