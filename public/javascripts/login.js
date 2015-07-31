$(document).ready(function(){
    $('#login-form').submit(function(e){
        e.preventDefault();
        formData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: '/',
            data: formData,
            success: function(){
            	console.log('login success');
                window.location='/home';
            },
            error: function(res){
                $('#login-error').show();
                if(res.status == 500) {
                    $('#login-error').html('Server error, try it again later');
                }else{
                    $('#login-error').html('Either username or password is incorrect');
                }
            }
        });
    });
});