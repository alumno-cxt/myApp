function crHandler(code){
    $('#alumns').css('borderColor','');
    $('#teacher').css('borderColor','');
    $('#room-name').css('borderColor','');
    $('#loaded-alumn').css('borderColor','');
    $('#create-room-error').hide();
    $('#create-room-success').hide();
    switch (code) {
        case 'room-short':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('El nombre de la sala debe tener más de 6 letras');
            $('#create-room-error').show();
            break;
        case 'teacher-404':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('El nombre del profesor no existe');
            $('#create-room-error').show();
            break;
        case 'alumns-void':
            $('#loaded-alumn').css('borderColor','red');
            $('#create-room-error').html('No hay alumnos en la lista');
            $('#create-room-error').show();
            break;
        case 'alumn-404':
            break;
        case 'room-exists':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('El nombre de la sala ya esxiste');
            $('#create-room-error').show();
            break;
    }
}

var teacherExists = true;
var alumnExists = true;

function validate(room, teacher){
    if(room.length < 6) {
        crHandler('room-short');
        return 0;
    }
    if(teacher.length < 6) {
        crHandler('room-short');
        return 0;
    }
}

$(document).ready(function() {
    $('#create-room-error').show();

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
        var x = 0;
        $('#loaded-alumns li').each(function(e){
            a.push(e.text());
            x++;
        });
        if(x == 0){
            crHandler('alumns-void');
            return
        }
        var t = $('#teacher').val();
        var r = $('#room-name').val();
        if(!validate(t,r)) return;
        $.ajax({
            type: 'POST',
            url: '/rooms',
            data: JSON.stringify({room: r, teacher: t, alumns: a}),
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