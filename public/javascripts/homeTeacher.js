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
            success: function (list, e, jqXHR) {
                console.log(list);
                for (var i in list.rooms) {
                    console.log(list.rooms[i]);
                    $('#my-select').append($('<option>', {
                        text: list.rooms[i].room_name, data_room: list.rooms[i].licode_room
                    }));
                }
            },
            error: function (a, e, jqXHR) {
                console.log('error');
            }
        });
    });

    $('#enter-room').click(function(e){
        var r = $("#my-select option:selected").attr('data_room');
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