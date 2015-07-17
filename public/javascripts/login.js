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
            error: function(){
                $('#login-error').show();
            }
        });
    });
});