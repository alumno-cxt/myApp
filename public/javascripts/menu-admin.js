function resetView(){
    $('#register').hide();

}

$(document).ready(function(){
    $('#register-show').click(function(){
        $('#register').show();
    });
    $('#log-out').click(function(){
        $.ajax({
            type: 'DELETE',
            url: '/',
            success: function(res){
                window.location='/';
            }
        });
    });

});