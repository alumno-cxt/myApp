var fs = require('fs');
var sys = require('sys');
var exec = require('child_process').exec;
var usersMgr = require('../lib/usersManager');
var express = require('express');
var router = express.Router();


/* Define opts for sending files */
var resFileOpts = {
    root: './views/'
};

/* GET login page OR attempt automatic log-in */
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
router.delete('/', function(req, res){
    req.session.destroy();
    res.status('200').end();
});

/* GET home page. */
router.get('/home', function(req, res){
    if(!(req.session.role === undefined || req.session.email === undefined)){
        if(req.session.role === 'admin'){
            res.sendFile('homeAdmin.html',resFileOpts);
        }
        if(req.session.role === 'planner'){
            res.sendFile('homePlanner.html',resFileOpts);
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
    usersMgr.getRoomName(req.session.room, function(err, room_name){
        if (err) return next(err);
        if(req.session.role == 'alumn'){
            res.render('meetingAlumn', {token: req.session.token, role: req.session.role, nick: req.session.nick });
            return;
        }
        if(req.session.role == 'teacher'){
            res.render('meetingTeacher', {room_name: room_name, token: req.session.token, role: req.session.role, nick: req.session.nick});
            return;
        }
        res.status('404').end();
    });
});

/* GET forgot page */
router.get('/forgot', function (req, res) {
    res.sendFile('forgot.html',resFileOpts);
});

/* Attempt password recovery. */
router.post('/forgot', function (req, res) {
    usersMgr.prepareReset(req.body.email, function(err){
        if(err){
            next(err);
        }else{
            res.status('203').end();
        }
    });
});

/* Attempt log-in by token. */
router.get('/reset', function (req, res, next) {
    usersMgr.checkExpiration(req.query.email, req.query.token, function(err, u){
        if(err){
            next(err);
        }else{
            req.session.nick = u.nick;
            req.session.role = u.role;
            req.session.email = u.email;
            res.redirect('/home');
        }
    });
});


router.get('/videos', function (req, res) {
    if(req.session.nick === undefined) return res.redirect('/');
    usersMgr.findVideos(req.session.nick, function(err, list){
        if(err){
            return next(err);
        }else{
            res.status('200').send({videos: list}).end();
        }
    });
});

router.get('/videos/:id', function (req, res, next) {
    if(req.session.nick === undefined) return res.redirect('/');
    var file = '/home/alex/tmp/'+req.params.id+'.webm';
    var range = req.headers.range;
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);

    fs.stat(file, function (err, stats) {
        if(err){
            return res.status('404').end();
        }
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunk_size = (end - start) + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunk_size,
            "Content-Type": "video/webm"
        });

        var stream = fs.createReadStream(file, {start: start, end: end})
            .on("open", function () {
                stream.pipe(res);
            })
            .on("error", function (err) {
                next(err);
            });
    });
});

router.post('/videos', function (req, res) {
    if(req.session.nick === undefined) return res.redirect('/');
    if(req.session.role !== 'teacher') return res.status('401').end();
    var date = (new Date()).toISOString().split('T');
    console.log(date[0]);
    var teacherRec = req.query.idTeacher;
    var screenRec = req.query.idScreen;
    var room = req.query.room;
    //Wait for licode to free the file
    setTimeout(function() {
        exec("avconv -i /home/alex/tmp/"+teacherRec+".mkv /home/alex/tmp/"+teacherRec+".webm && "+
            "avconv -i /home/alex/tmp/"+screenRec+".mkv /home/alex/tmp/"+screenRec+".webm", function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            sys.print('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }else{
                usersMgr.addRecording(room ,teacherRec, screenRec, date[0], function(err){
                    if(err){
                        console.error(err);
                    }else{
                        console.log('recording added');
                    }
                });
            }
        });
    }, 10000);
});

module.exports = router;
