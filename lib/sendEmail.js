var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'tfgappmailer@gmail.com',
        pass: 'tfgappmailerpass'
    }
});

var templates = {};

fs.readFile('./views/email/resetPassword.html', 'utf-8', function(err, html){
    templates.reset = handlebars.compile(html);
});

module.exports = function(templ, data, callback){

    var template;

    switch (templ){
        case 'reset':
            template = templates.reset;
            break;
        default:
            callback(new Error('Template name required'));
            return;
    }

    if(data.to === undefined) return callback(new Error('e-mail receiver required'));

    var mailOpts = {
        from: data.from !== undefined ? data.from : 'Master <master@elearn.com>',
        to: data.to,
        subject: data.subject !== undefined ? data.subject : 'Account Info',
        html: template(data)
    }

    smtpTransport.sendMail(mailOpts, function(error, res){
        if (error){
            return callback(error);
        }else{
            callback(null,res);
        }
    });
}