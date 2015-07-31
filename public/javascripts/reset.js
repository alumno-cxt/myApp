$(document).ready(function(){
    $('#forgot-form').submit(function(e){
        e.preventDefault();
        formData = $(this).serialize();
        $('#forgot-error').hide();
        $.ajax({
            type: 'POST',
            url: '/reset',
            data: formData,
            success: function(){
            	window.location='/home'
            },
            error: function(){
                $('#forgot-error').show();
            }
        });
    });
});