$(document).ready(function(){
    //token is stored in <meta> tag at the html page
    var tokenJ = $('meta[name=token]').attr("content");
    var nick = $('meta[name=nick]').attr("content");
    var room_name = $('meta[name=room_name]').attr("content");

    var recording = false;
    var sharing = false;
    var recIdTeacher;
    var recIdScreen;
    var room = Erizo.Room({token: tokenJ});

    var screenStream = Erizo.Stream({screen: true, videoSize:[1600, 1000, 960, 600], attributes:{nick: nick, role: 'teacher', media: 'screen'}});
    var localStream = Erizo.Stream({video:true, audio: true, data:true, videoSize:[1600, 1000, 960, 600],
        attributes:{nick: nick, role: 'teacher', type: 'video'}});

    localStream.addEventListener('access-accepted', function() {
        console.log('access granted to video');
        room.publish(localStream, {maxVideoBW: 500});
        localStream.play('video-teacher');
    });

    screenStream.addEventListener('access-accepted', function() {
        console.log('access granted to screen');
        room.publish(screenStream, {maxVideoBW: 500});
        sharing = true;
        screenStream.play('screen-teacher');
    });

    $('#share-screen').click(function(){
        if(sharing) {
            $('#screen-teacher').empty();
            sharing = false;
        }else{
            screenStream.init();
        }
    });

    $('#start-rec').click(function(){
        if(recording){
            room.stopRecording(recIdTeacher, function(result, error){
                if (result === undefined){
                    console.log("Error", error);
                } else {
                    console.log("Stopped recording!");
                    recording = false;
                }
            });
            room.stopRecording(recIdScreen, function(result, error){
                if (result === undefined){
                    console.log("Error", error);
                } else {
                    console.log("Stopped recording!");
                    recording = false;
                }
            });
            $.ajax({
                type: 'POST',
                url: '/videos?room='+room_name+'&idTeacher='+recIdTeacher+'&idScreen='+recIdScreen,
                error: function (res) {
                },
                success: function (res){
                    console.log('video successfully created');
                }
            });
        }else {
            room.startRecording(localStream, function (recordingId, error) {
                if (recordingId === undefined) {
                    console.log("Error", error);
                } else {
                    console.log("Recording started, the id of the recording is ", recordingId);
                    recIdTeacher = recordingId;
                    recording = true;
                }
            });
            room.startRecording(screenStream, function (recordingId, error) {
                if (recordingId === undefined) {
                    console.log("Error", error);
                } else {
                    console.log("Recording started, the id of the recording is ", recordingId);
                    recIdScreen = recordingId;
                    recording = true;
                }
            });
        }
    });

    $('#message').submit(function(e){
        if(localStream){
            e.preventDefault();
            var $c = $('#usermsg');
            var m = $c.val();
            $c.val('');
            $c.focus();
            $c = $('#chatbox');
            $c.append($('<div>'));
            $c.find('div').last().html('<p><b>' + nick + ': </b>' + m + '</p>');
            $c.animate({scrollTop: 0xfffffff});
            localStream.sendData({text: m, nick: nick});
        }
    });

    room = Erizo.Room({token: tokenJ});
    var subscribeToStreams = function (streams) {
        for (var i = 0; i < streams.length; i++) {
            var stream = streams[i];
            if (localStream.getID() !== stream.getID() && screenStream.getID() !== stream.getID()) {
                room.subscribe(stream);
            }
        }
    };

    room.addEventListener("room-connected", function (roomEvent) {
        localStream.init();
        console.log('in the room');
        console.log(localStream.hasData());
        subscribeToStreams(roomEvent.streams);
    });

    room.addEventListener("stream-subscribed", function(streamEvent) {
        console.log('stream subscribed');
        var stream = streamEvent.stream;
        stream.addEventListener("stream-data", function(evt){
            var $c = $('#chatbox').append($('<div>'));
            $c.find('div').last().html('<p><b>' + evt.msg.nick + ': </b>' + evt.msg.text + '</p>');
        });
        $('#video-student').append($('<div>').attr('id', stream.getID().toString()));
        stream.show(stream.getID().toString());
    });

    room.addEventListener("stream-added", function (streamEvent) {
        console.log('added stream');
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
    });

    room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
            $('#' + stream.elementID.toString()).remove();
        }
    });

    room.addEventListener("stream-failed", function (){
        console.log("STREAM FAILED, DISCONNECTION");
        room.disconnect();

    });

    room.connect();

});