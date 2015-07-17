$(document).ready(function(){
    $('#forgot-form').submit(function(e){
        e.preventDefault();
        formData = $(this).serialize();
        $('#loading').show();
        $('#forgot-error').hide();
        $.ajax({
            type: 'POST',
            url: '/forgot',
            data: formData,
            success: function(){
            	$('#forgot-form input:submit').prop('disabled', true);
            	$('#loading').hide();
            	$('#forgot-form input:submit').css({opacity: 0.5});
            	$('#forgot-success').show();
            },
            error: function(){
            	$('#loading').hide();
                $('#forgot-error').show();
            }
        });
    });
});