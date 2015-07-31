function resetView(){
    $('#room-selector').hide();
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

    $('#videos').click(function () {
        $.ajax({
            type: 'GET',
            url: '/rooms',
            success: function (list, e, jqXHR) {
                $.ajax({
                    type: 'POST',
                    url: '/rooms/' + list.rooms[3].licode_room + '/createToken',
                    success: function (a, e, jqXHR) {
                        var room = Erizo.Room({token: a});
                        var stream = Erizo.Stream({video: true, recording:"638682178687304300"});
                        var subscribeToStreams = function (streams) {
                            for (var index in streams) {
                                var stream = streams[index];
                                room.subscribe(stream);
                            }
                        };

                        room.addEventListener("room-connected", function (roomEvent) {
                            console.log('in the room');
                            subscribeToStreams(roomEvent.streams);
                            room.publish(stream);
                        });

                        room.addEventListener("stream-subscribed", function(streamEvent) {
                            var stream = streamEvent.stream;
                            stream.show('playit');
                        });

                        room.addEventListener("stream-added", function (streamEvent) {
                            console.log('added stream');
                            var streams = [];
                            streams.push(streamEvent.stream);
                            subscribeToStreams(streams);
                        });

                        room.connect();
                    }
                });
            },
            error: function (a, e, jqXHR) {
                console.log('error');
            }
        });
    });


    $('#rooms').click(function () {
        resetView();
        $('#room-selector').show();
        $.ajax({
            type: 'GET',
            url: '/rooms',
            success: function (list, e, jqXHR) {
                console.log(list);
                for (var i in list.rooms) {
                    console.log(list.rooms[i]);
                    $('#my-select').append($('<option>', {
                        text: list.rooms[i].room_name +' - Prof. '+ list.rooms[i].teacher, data_room: list.rooms[i].licode_room
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