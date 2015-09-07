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

    var speaking;

    var screenStream;
    var localStream = Erizo.Stream({video:true, audio: true, data:true, videoSize:[1600, 1000, 960, 600],
        attributes:{nick: nick, role: 'teacher', type: 'video'}});

    localStream.addEventListener('access-accepted', function() {
        console.log('access granted to video');
        room.publish(localStream, {maxVideoBW: 500});
        localStream.play('video-teacher');
    });

    $('#share-screen').click(function(){
        if(sharing) {
            room.unpublish(screenStream);
            screenStream = undefined;
            $('#screen-teacher').empty();
            sharing = false;
        }else{
            screenStream = Erizo.Stream({screen: true, videoSize:[1600, 1000, 960, 600], attributes:{nick: nick, role: 'teacher', media: 'screen'}});
            screenStream.addEventListener('access-accepted', function() {
                console.log('access granted to screen');
                room.publish(screenStream, {maxVideoBW: 500});
                sharing = true;
                screenStream.play('screen-teacher');
            });
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
        }else if(screenStream != undefined && localStream != undefined){
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
            localStream.sendData({text: m, nick: nick, type:'message'});
        }
    });

    room = Erizo.Room({token: tokenJ});
    var subscribeToStreams = function (streams) {
        for (var i = 0; i < streams.length; i++) {
            var stream = streams[i];
            if (localStream.getID() !== stream.getID() && (screenStream == undefined || screenStream.getID() !== stream.getID())) {
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
        var attributes = stream.getAttributes();
        stream.addEventListener("stream-data", function(evt){
            var $c = $('#chatbox').append($('<div>'));
            $c.find('div').last().html('<p><a href=javascript:void(0)>' + evt.msg.nick + ': </a>' + evt.msg.text + '</p>');
            $c.find('a').last().click(function(){
                speaking = evt.msg.nick;
                localStream.sendData({nick: evt.msg.nick, type:'COMM'});
            });
        });

        $('#video-student').append($('<div>'));
        $('#video-student > div').last().append($('<div>').attr({'id': stream.getID().toString(), 'class': "sframe"}));
        $('#video-student > div').last().append($('<p>').attr('class', "sname").html(attributes.nick));
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
            $('#' + stream.elementID.toString()).parent().remove();
        }
    });

    room.addEventListener("stream-failed", function (){
        console.log("STREAM FAILED, DISCONNECTION");
        room.disconnect();

    });

    room.connect();

});