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

module.exports = router;
