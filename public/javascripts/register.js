$(document).ready(function(){
    $('#register-form').submit(function(e){
        e.preventDefault();
        formData = $(this).serialize();
        if(registerValidator()) return;
        registerHandler('submit');
        $.ajax({
            type: 'POST',
            url: '/users',
            data: formData,
            success: function(res){
            	registerHandler('success');
            },
            error: function(res){
            	if(res.status == 500){
            		registerHandler('500');
            	}else{
            		registerHandler('duplicate');
            	}
            }
        });
    });
	$('#create').click(function(e){
        $.ajax({
            type: 'GET',
            url: '/room',
            success: function(){
            	return;
            }
        });		
	});
});

function registerHandler(code){
	$('#register-loading').hide();
    $('#register-success').hide();
    $('#register-error').hide();
    $('#register input#nick').css('borderColor','');
    $('#register input#email').css('borderColor','');
    $('#register input#pass').css('borderColor','');
    switch (code){
    	case 'submit':
    		$('#register-loading').show();
        	break;
        case 'email': 
        	$('#register input#email').css('borderColor','red');
        	$('#register-error').html('El formato del email no es válido');
            $('#register-error').show();
        	break;
        case 'short-nick': 
        	$('#register input#nick').css('borderColor','red');
        	$('#register-error').html('El nombre de usuario debe tener entre 6 y 14 caracteres');
            $('#register-error').show();
        	break;
        case 'short-pass': 
        	$('#register input#pass').css('borderColor','red');
        	$('#register-error').html('La contraseña debe tener entre 8 y 25 caracteres');
            $('#register-error').show();
        	break;
        case 'nick':
        	$('#register input#nick').css('borderColor','');
    	    $('#register-error').html('El nombre de usuario solo puede contener letras en minúscula, números y "_" ');
            $('#register-error').show();
        	break;
        case 'pass':
        	$('#register input#pass').css('borderColor','');
 			$('#register-error').html('La contraseña debe tener al menos un número y una mayúscula');
            $('#register-error').show();
            break;
        case 'success':
            $('#register-success').show();
            x = 0;
            $('#register input').each(function(){
                if(x==3) return;
                x++;
                $(this).val('');
                console.log(x);
            });
            $('#register input#nick').first().focus();
            break;
        case '500':
        	$('#register-error').html('Error en el servidor');
            $('#register-error').show();
        	break;
        case 'duplicate':
        	$('#register input#nick').css('borderColor','red');
            $('#register-error').html('Ya existe otro usuario con ese nombre');
            $('#register-error').show();
            break;
    }
}

function registerValidator(){
	var email = $('#register input#email').val();
	var nick = $('#register input#nick').val();
	var pass = $('#register input#pass').val();
	if(!(5 < nick.length && nick.length < 14)){registerHandler('short-nick'); return 1}
	if(!nickRegex.test($('#register input#nick').val())){ registerHandler('nick'); return 1}
	if(!emailRegex.test($('#register input#email').val())){ registerHandler('email'); return 1}
	if(!(7 < pass.length && pass.length < 25)){registerHandler('short-pass'); return 1}
	if(!passRegex.test($('#register input#pass').val())){ registerHandler('pass'); return 1}
    return 0;
}

var emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
var passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,25}$/;
var nickRegex = /^[a-z][a-z0-9_]{5,14}$/;