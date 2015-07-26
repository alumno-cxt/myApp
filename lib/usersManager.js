var db = require('./postgresDB');
var mail = require('./sendEmail');
var password = require('password-hash-and-salt');
var squel = require('squel');


var guid = function(){
    function s4(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

//Generic search function to check if role matches with nick
var isGeneric = function(nick, pass, role, callback){
    //Notice the LIKE at role search
    var queryString = "SELECT * FROM app_user WHERE nick = '" + nick +
        "' AND role LIKE '" + role +"';";
    db.query(queryString, function(err,result){
        //Check if DB error
        if(err) return callback(err);
        //Check if no match
        if(result.rowCount != 1){
            error = (role !== '%') ? new Error('El usuario no es un ' + role) :
                new Error('El usuario no esta registrado');
            error.status = 404;
            return callback(error);
        }
        //Verify pass against stored hash
        password(pass).verifyAgainst(result.rows[0].hash,function (err, verified){
            if(verified){
                //Get and send back user data
                userData = {nick: result.rows[0].nick, role: result.rows[0].role, email: result.rows[0].email}
                callback(null, userData);
            }else{
                //Password verification error
                error = new Error('Contraseña incorrecta');
                error.status = 401;
                callback(error);
            }
        });
    });
}

//Function to search for the nick at the DB
exports.isRegistered = function(nick,pass,callback){
    //Notice the % that matches any string in SQL
    isGeneric(nick, pass, '%', function(err, userData){
        if(err) return callback(err);
        callback(null, userData);
    });
}

exports.isAlumn = function(nick,pass,callback){
    isGeneric(nick, pass, 'alumn', function(err, userData){
        if(err) return callback(err);
        callback(null, userData);
    });
}

exports.isTeacher = function(nick,pass,callback){
    isGeneric(nick, pass, 'teacher', function(err, userData){
        if(err) return callback(err);
        callback(null, userData);
    });
}

exports.isAdmin = function(nick,pass,callback){
    isGeneric(nick, pass, 'admin', function(err, userData){
        if(err) return callback(err);
        callback(null, userData);
    });
}

var existsEmail = function(email, callback){
    queryString = "SELECT * FROM app_user WHERE email = '" + email + "';";
    db.query(queryString, function(err,result){
        //Check if DB error
        if(err) return callback(err);
        //Check if no match
        if(result.rowCount != 1){
            error = new Error('El email no esta registrado');
            error.status = 404;
            return callback(error);
        }else{
            return callback(null)
        }
    });
}

exports.register = function(data,callback){
    password(data.pass).hash(function (err, hash){
        if(data.role == 'admin' || data.role == 'alumn' || data.role == 'teacher' || data.role == 'planner'){
            var queryString = squel.insert().into("app_user").setFieldsRows(
                [{ nick: data.nick, hash: hash, role: data.role, email: data.email}]).toString();
            db.query(queryString, function(err,result){
                if(err){
                    if(err.code = '23505') {
                        error = new Error('El nombre de usuario ya existe');
                        error.status = 409;
                        callback(error);
                    }else{
                        callback(err);
                    }
                }else
                    callback(null,result);
            });
        }else{
            error = new Error('El nombre del rol es incorrecto');
            error.status = 400;
            return callback(error);
        }
    });
}

exports.findByNameAndRole = function(pattern, role, callback){
    if(role == 'alumn' || role == 'teacher'){
        pattern = pattern + '%';
        var queryString = "SELECT * FROM app_user WHERE nick LIKE '" + pattern +
            "' AND role LIKE '" + role +"';";
        db.query(queryString, function(err,result){
            if(err) return callback(err);
            var list = {users:[]};
            for(var i in result.rows){
                list.users[i] = result.rows[i].nick;
            }
            callback(null, list);
        });

    }else{
        error = new Error('El nombre del rol es incorrecto');
        error.status = 400;
        return callback(error);
    }
}

exports.prepareReset = function(email, callback){
    existsEmail(email, function(err){
        if(err) return callback(err);
        var token = guid();
        var unixTime = Math.round((new Date()).getTime()/1000) + 3600;
        var queryString = "UPDATE app_user SET recovery_token = '" + token +
            "', token_expiration = '" + unixTime + "' WHERE email = '" + email + "'";
        db.query(queryString, function(err,result){
            if(err) return callback(err);
            mail('reset', {to: email, email: email, token: token}, function(err, smtp_res){
                if(err){
                    callback(err);
                }else{
                    callback(null, smtp_res);
                }
            });
        });
    });
}

exports.checkExpiration = function(email, token, callback){
    var queryString = "SELECT * FROM app_user WHERE email = '" + email +
        "' AND recovery_token = '" + token +"';";
    db.query(queryString, function(err,result){

        if(err) return callback(err);
        if(result.rowCount != 1) {
            error = new Error('Token no válido');
            error.status = 400;
            return callback(error);
        }
        var t = Math.round((new Date()).getTime()/1000);
        if(result.rows[0].token_expiration < t){
            error = new Error('Token expirado');
            error.status = 410;
            return callback(error);
        }else{
            userData = {nick: result.rows[0].nick, role: result.rows[0].role, email: result.rows[0].email}
            callback(null, userData)
        }
    });
}

exports.resetPassword = function(email, pass, callback){
    var queryString = "SELECT * FROM app_user WHERE email = '" + email + "';";
    db.query(queryString, function(err,result){

        if(err) return callback(err);
        if(result.rowCount != 1) return callback(new Error('token no valido'));

        var t = Math.round((new Date()).getTime()/1000);
        if(result.rows[0].token_expiration < t) callback(new Error('token expirado'));
        password(pass).hash(function (err, hash){
            if(err) return callback(err);
            var queryString = "UPDATE app_user SET hash = '" + hash +
                "' WHERE email = '" + email + "'";
            db.query(queryString, function(err,result){
                if(err){
                    callback(err);
                }else{
                    callback(null, result);
                }
            });
        });
    });
}

exports.updateUser = function(data, callback){
    if(data.email === undefined) {
        error = new Error('Se necesita el email de usuario para actualizar los datos');
        error.status = 400;
        return callback(error);
    }
    var queryString = "UPDATE app_user SET "
    if(data.pass !== undefined){
        password(data.pass).hash(function (err, hash){
            if(err) return callback(err);
            queryString += 'pass = "' + hash + "',";
        });
    }
    if(data.nick !== undefined) queryString += 'nick = "' + data.nick + "',";
    if(data.email !== undefined) queryString += 'email = "' + data.email + "',";
    //Remove last comma
    queryString = queryString.substring(0,queryString.length-1) + " WHERE email = '" + data.email + "';";
}

exports.createRoom = function(data, callback){
    var queryString = "INSERT INTO classroom(room_name, teacher, licode_room) VALUES ('"
        +data.room_name+"','"+data.teacher+"','"+data.licode_room+"')";
    console.log(queryString);
    db.query(queryString, function(err,result){
        if(err){
            if(err.code == '23505') err.status = 409;
            callback(err);
        }else{
            var queryString2 = "INSERT INTO asists(alumn, classroom)VALUES ";
            for(var i in data.alumns){
                queryString2 += "('"+data.alumns[i]+"','"+data.room_name+"'),";
            }
            queryString2 = queryString2.substring(0,queryString2.length-1);
            console.log(queryString2);
            db.query(queryString2, function(err,result){
                if(err){
                    callback(err);
                }else{
                    callback(null, result);
                }
            });
        }
    });
}

exports.findAlummnRooms = function(alumn, callback){
    var queryString = "SELECT classroom, licode_room, alumn FROM classroom c " +
        "JOIN asists a ON c.room_name = a.classroom WHERE alumn ='" +alumn+ "';";
    db.query(queryString, function(err,result){
        if(err){
            callback(err);
        }else{
            var result = {room_name: result.rows[0].classroom, licode_room: result.rows[0].licode_room}
            callback(null, result);
        }
    });
}

exports.findTeacherRooms = function(teacher, callback) {
    var queryString = "SELECT classroom, licode_room FROM classroom " +
        "WHERE teacher ='" + teacher + "';";
    db.query(queryString, function (err, result) {
        if (err) {
            callback(err);
        } else {
            var result = {room_name: result.rows[0].classroom, licode_room: result.rows[0].licode_room}
            callback(null, result);
        }
    });
}