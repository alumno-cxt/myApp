var localStream;
var conn = 0;
$(document).ready(function(){
    //token is stored in <meta> tag at the html page
    var tokenJ = $('meta[name=token]').attr("content");
    var role = $('meta[name=role]').attr("content");
    var nick = $('meta[name=nick]').attr("content");
    console.log(tokenJ);

    localStream = Erizo.Stream({video: true, audio: false, data:true, videoSize:[240, 180, 240, 180],
        attributes:{nick: nick, role: role}});
    localStream.init();
    localStream.addEventListener('access-accepted', function(ev) {
        console.log('access granted');
        if(conn) room.publish(localStream, {maxVideoBW: 300});
    });

    $('#message').submit(function(e){
        if(localStream){
            e.preventDefault();
            var m = $('#usermsg').val();
            $('#chatbox').append($('<div>', {text: m}));
            $('#usermsg').val('');
            $('#usermsg').focus();
            localStream.sendData({text: m});
        }
    });

    room = Erizo.Room({token: tokenJ});
    var subscribeToStreams = function (streams) {
        for (var index in streams) {
            var stream = streams[index];
            if (localStream.getID() !== stream.getID()) {
                room.subscribe(stream);
            }
        }
    };

    room.addEventListener("room-connected", function (roomEvent) {
        conn=1;
        console.log('in the room');
        console.log(localStream.hasData());
        subscribeToStreams(roomEvent.streams);
    });

    room.addEventListener("stream-subscribed", function(streamEvent) {
        console.log('stream subscribed');
        var stream = streamEvent.stream;
        stream.addEventListener("stream-data", function(evt){
            $('#chatbox').append($('<div>',{text: evt.msg.text}));
        });
        //var div = document.createElement('div');
        //div.setAttribute("style", "width: 320px; height: 240px;");
        //div.setAttribute("id", "test" + stream.getID());
        //document.body.appendChild(div);
        stream.show('video');
    });

    room.addEventListener("stream-added", function (streamEvent) {
        console.log('added stream');
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
        //document.getElementById("recordButton").disabled = false;
    });



    room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
            var element = document.getElementById(stream.elementID);
            document.body.removeChild(element);
        }
    });

    room.addEventListener("stream-failed", function (streamEvent){
        console.log("STREAM FAILED, DISCONNECTION");
        room.disconnect();

    });

    room.connect();

});