$(document).ready(function() {
    $('#log-out').click(function () {
        $.ajax({
            type: 'DELETE',
            url: '/',
            success: function (res) {
                window.location = '/';
            }
        });
    });


    $.ajax({
        type: 'GET',
        url: '/rooms',
        success: function(a,e,jqXHR){
            j = JSON.parse(a);
            for (var i=0; i<j.length; i++){
                console.log(j[i]);
                $('#my-select').append($('<option>',{text: j[i]._id}));
            }
        },
        error: function(){
            console.log('error');
        }
    });

});