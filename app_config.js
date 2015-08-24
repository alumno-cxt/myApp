/*
 * Created by alex on 23/08/15.
 */
var config = {};


/* ****************************
*         APP CONFIG          *
* *************************** */

//Select a server name
config.hostname = 'tfgudc.no-ip.org';

//Port for unsafe connections
config.http_port = '80';

//Port for SSL connections
config.https_port = '443';


/* *****************************
 *       LICODE CONFIG         *
 * *************************** */

//Route to licode_config.js file
config.licode_config = '../../licode/licode_config.js';

//Nuve service URL
config.nuve_url = 'http://localhost:3000/';


/* *****************************
 *      POSTGRESQL CONFIG      *
 * *************************** */

//DB name
config.db_name = 'tfgDB';

//DB username
config.db_username = 'tfg';

//DB user password
config.db_pass = 'tfg';


/* *****************************
 *      NODEMAILER CONFIG      *
 * *************************** */

//Mail account
config.mail_service = 'Gmail';

//Mail user URL
config.mail_user_url = 'tfgappmailer@gmail.com';

//Mail user password
config.mail_pass = 'tfgappmailerpass';



////////////////////////////////
module.exports = config;








