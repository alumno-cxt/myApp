var usersMgr = require('../lib/usersManager');
var express = require('express');
var router = express.Router();

/* Define opts for sending files */
var resFileOpts = {
    root: './views/'
}

/* GET login page OR attemp automatic log-in */
router.get('/', function(req, res){
    if(req.session.email === undefined || req.session.role === undefined){
        res.sendFile('login.html', resFileOpts);
    }else{
        res.redirect('/home')
    }
});

/* Log-in AND GET home page. */
router.post('/', function(req, res, next){
    usersMgr.isRegistered(req.body.nick, req.body.pass, function(err, u){
        if(!err){
            req.session.nick = u.nick;
            req.session.role = u.role;
            req.session.email = u.email;
            res.status('200').end();
        }else{
            next(err);
        }
    });
});

/* End session */
router.delete('/', function(req, res, next){
    req.session.destroy();
    res.status('200').end();
});

/* GET home page. */
router.get('/home', function(req, res){
    if(!(req.session.role === undefined || req.session.email === undefined)){
        if(req.session.role === 'admin'){
            res.sendFile('homeAdmin.html',resFileOpts);
        }
        if(req.session.role === 'alumn'){
            res.sendFile('homeAlumn.html', resFileOpts);
        }
        if(req.session.role === 'teacher'){
            res.sendFile('homeTeacher.html', resFileOpts);
        }
    }else{
        res.redirect('/');
    }
});

/* GET home page. */
router.get('/meeting', function(req, res){
    if(req.session.email === undefined){ res.status('401'); return;}
    if(req.session.token === undefined){ res.status('401'); return;}
    if(req.session.role == 'alumn'){ res.render('meetingAlumn', {tokenR: req.session.token}); return;}
    if(req.session.role == 'teacher'){ res.render('meetingTeacher', {tokenR: req.session.token}); return;}
    res.status('404');
});

/* GET forgot page */
router.get('/forgot', function (req, res) {
    res.sendFile('forgot.html',resFileOpts);
});

/* Attemp password recovery. */
router.post('/forgot', function (req, res) {
    usersMgr.prepareReset(req.body.email, function(err){
        if(err){
            next(err);
        }else{
            res.status('203').end();
        }
    });
});

/* Attemp log-in by token. */
router.get('/reset', function (req, res, next) {
    usersMgr.checkExpiration(req.query.email, req.query.token, function(err, u){
        if(err){
            next(err);
        }else{
            req.session.nick = u.nick;
            req.session.role = u.role;
            req.session.email = u.email;
            res.sendFile('reset.html',resFileOpts);
        }
    });

});

router.post('/reset', function (req, res, next) {
    usersMgr.resetPassword(req.session.email, req.body.pass, function(err){
        if(err){
            res.status('400').end();
        }else{
            res.status('200').end();
        }
    });
});


module.exports = router;
