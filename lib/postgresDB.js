var pg = require('pg');

var conString = "postgres://tfg:tfg@localhost/tfgDB";

//client = new pg.Client(conString);

exports.query = function(query, callback){
    pg.connect(conString, function(err, client, done) {
        if(err) {
            callback(err);
        }else{
            client.query(query, function(err, result) {
                done();
                if(err) {
                    callback(err);
                }else{
                    client.end();
                    callback(null, result);
                }
            });
        }
        pg.end();
    });
}
