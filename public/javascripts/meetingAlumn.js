var localStream;
var conn = 0;

$(document).ready(function(){
    //token is stored in <meta> tag at the html page
    var tokenJ = $('meta[name=token]').attr("content");
    var nick = $('meta[name=nick]').attr("content");
    var room;
    console.log(tokenJ);

    localStream = Erizo.Stream({video: true, audio: false, data:true, videoSize:[240, 180, 240, 180],
        attributes:{nick: nick, role: 'alumn'}});
    localStream.init();
    localStream.addEventListener('access-accepted', function() {
        console.log('access granted');
        if(conn) room.publish(localStream, {maxVideoBW: 300});
    });

    $('#video').click(function(){
        //localStream.init();
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
        for (var stream in streams) {
            //var stream = streams[index];
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
        var attributes = stream.getAttributes();
        stream.addEventListener("stream-data", function(evt){
            $('#chatbox').append($('<div>'));
            $('div', this).last().html('<p><b>' + evt.msg.nick + ': </b>' + evt.msg.text + '</p>');
        });
        console.log(attributes);
        if(attributes.role == 'teacher') stream.show('video-teacher');
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
          ///////////////////////////////////////////
        }
    });

    room.addEventListener("stream-failed", function (){
        console.log("STREAM FAILED, DISCONNECTION");
        room.disconnect();

    });

    room.connect();



});