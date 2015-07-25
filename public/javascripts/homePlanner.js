function crHandler(code){
    $('#alumns').css('borderColor','');
    $('#teacher').css('borderColor','');
    $('#room-name').css('borderColor','');
    switch (code) {
        case 'room-short':
            $('#room-name').css('borderColor','red');
            break;
        case 'teacher-404':
            break;
        case 'teacher-void':
            break;
        case 'alumn-404':
            break;
        case 'room-exists':
            break;
    }
}

function validate(room, teacher){
    if(room.length < 6) {
        crHandler('room-short');
        return 0;
    }

}

$(document).ready(function() {
    $('#register-show').click(function () {
        $('#register').show();
    });

    $('#log-out').click(function () {
        $.ajax({
            type: 'DELETE',
            url: '/',
            success: function (res) {
                window.location = '/';
            }
        });
    });

    $('#create-room-form').submit(function(e) {
        e.preventDefault();
        var a = [];
        var i = 0;
        $('#loaded-alumns li').each(function(e){
            l.push(e.text());
        });
        var t = $('#teacher').val();
        var r = $('#room-name').val();
        if(!validate(t,r)) return;
        $.ajax({
            type: 'POST',
            url: '/rooms',
            data: JSON.stringify({room: r}),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-type", "application/json");
            },
            success: function (res) {
                registerHandler('success');
            },
            error: function (res) {
                if (res.status == 500) {
                    registerHandler('500');
                } else {
                    registerHandler('duplicate');
                }
            }
        });
    });

    $('#add-alumn-cr').click(function() {
        var a = $('#alumns').val();
        if(a.length = 0) return;
        $('#loaded-alumns').show();
        var f = false;
        $('#loaded-alumns li').each(function(){
            if($(this).text() == a){
                f = true;
            }
        });
        if(f) return;
        $('#loaded-alumns').append($('<li>', {text: a}));
        $('#alumns').val('');

    });

    $('#alumns').keydown(function(e){
        if(e.which == 13){
            var a = $('#alumns').val();
            if(a.length = 0) return;
            $('#loaded-alumns').show();
            $('#loaded-alumns li').each(function(e){
                if(e.text() == a){
                    return;
                }
            });
            $('#loaded-alumns').append($('<li>', {text: a}));
            $('#alumns').val('');
        }
    });


    $('#teacher').keyup(function(e){
        if(e.which == 13) return;
        var pattern = $('#teacher').val();
        $.ajax({
            type: 'GET',
            url: '/users?role=teacher&pattern=' + pattern,
            success: function (res) {
                $('#teacher-suggestion').empty();
                if (res.users.length != 0){
                    $('#teacher-suggestion').show();
                }else{
                    $('#teacher-suggestion').hide();
                }
                for(var i in res.users) {
                    $('#teacher-suggestion').append($('<li>', {text: res.users[i]}));
                }
                $('#teacher-suggestion li').click(function(){
                    $('#teacher').val($(this).text());
                    $('#teacher-suggestion').hide();
                });
            }
        });
    });

    $('#alumns').keyup(function(e){
        if(e.which == 13) return;
        var pattern = $('#alumns').val();
        $.ajax({
            type: 'GET',
            url: '/users?role=alumn&pattern=' + pattern,
            success: function (res) {
                $('#alumn-suggestion').empty();
                if (res.users.length != 0){
                    $('#alumn-suggestion').show();
                }else{
                    $('#alumn-suggestion').hide();
                }
                for(var i in res.users) {
                    $('#alumn-suggestion').append($('<li>', {text: res.users[i]}));
                }
                $('#alumn-suggestion li').click(function(){
                    $('#alumns').val($(this).text());
                    $('#alumn-suggestion').hide();
                });
            }
        });
    });

    $('#alumns').click(function(){
        $('#teacher-suggestion').hide();
    });

    $('#teacher').click(function(){
        $('#alumn-suggestion').hide();
    });

});