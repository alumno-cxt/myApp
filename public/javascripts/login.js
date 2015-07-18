$(document).ready(function(){
    $('#login-form').submit(function(e){
        e.preventDefault();
        formData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: '/',
            data: formData,
            success: function(){
            	console.log('success login');
                window.location='/home';
            },
            error: function(res){
                $('#login-error').show();
                if(res.status == 500) {
                    $('#login-error').html('Error en el servidor');
                }else{
                    $('#login-error').html('Los datos introducidos son incorrectos');
                }
            }
        });
    });
});