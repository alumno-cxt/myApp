var pg = require('pg');
var config = require('../app_config');

//Connection string format: postgres://username:password@hostname/database
var conString = "postgres://"+ config.db_username +":"+ config.db_pass +"@"
    + config.db_hostname + "/" + config.db_name;

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
};
