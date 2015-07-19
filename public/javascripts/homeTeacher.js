function resetView(){
    $('#salas').hide();
}

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


    $('#rooms').click(function () {
        resetView();
        
        $.ajax({
            type: 'GET',
            url: '/rooms',
            success: function (a, e, jqXHR) {
                j = JSON.parse(a);
                for (var i = 0; i < j.length; i++) {
                    //console.log(j[i]);
                    $('#my-select').append($('<option>', {text: j[i]._id}));
                }
            },
            error: function (a, e, jqXHR) {
                console.log('error');
            }
        });
    });

    $('#enter-room').click(function(e){
        var r = $("#my-select option:selected").text();
        console.log(r);
        $.ajax({
            type: 'POST',
            url: '/rooms/'+ r + '/createToken',
            data: JSON.stringify({room: r}),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-type", "application/json");
            },
            success: function (a, e, jqXHR) {
                window.location='/meeting';
            }
        });
    });

});