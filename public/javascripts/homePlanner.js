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
            $('#teacher').css('borderColor','red');
            $('#create-room-error').html('El nombre del profesor no existe');
            $('#create-room-error').show();
            break;
        case 'alumns-void':
            $('#loaded-alumn').css('borderColor','red');
            $('#create-room-error').html('No hay alumnos en la lista');
            $('#create-room-error').show();
            break;
        case 'alumn-404':
            $('#alumns').css('borderColor','red');
            $('#create-room-error').html('El nombre del alumno no existe');
            $('#create-room-error').show();
            break;
        case 'room-exists':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('El nombre de la sala ya existe');
            $('#create-room-error').show();
            break;
        case 'alumn-404':
            $('#alumns').css('borderColor','red');
            $('#create-room-error').html('El nombre del alumno no existe');
            $('#create-room-error').show();
            break;
        case 'success':
            $('#create-room-success').show();
            $('#alumns').val('');
            $('#teacher').val('');
            $('#room-name').val('');
            $('#loaded-alumns').empty();

            break;
        case '500':
            $('#create-room-error').html('Error en el servidor');
            $('#create-room-error').show();
            break;
    }
}



function validate(room, teacher, cb){
    if(room.length < 6) {
        crHandler('room-short');
        return 0;
    }
    if(teacher.length < 6) {
        crHandler('teacher-404');
        return 0;
    }
    $.ajax({
        type: 'GET',
        url: '/users/' + teacher +'?role=teacher',
        error: function (res) {
            crHandler('teacher-404');
            return cb(0);
        },
        success: function (res) {
            return cb(1);
        },
    });
}

$(document).ready(function() {
    $('#create-room-error').hide();

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
        $('#teacher-suggestion').hide();
        $('#alumn-suggestion').hide();
        e.preventDefault();
        var a = [];
        var i = 0;
        var x = 0;
        $('#loaded-alumns li').each(function(e){
            a.push($(this).text());
            x++;
        });
        if(x == 0){
            crHandler('alumns-void');
            return;
        }
        var t = $('#teacher').val();
        var r = $('#room-name').val();
        validate(r,t, function(c){
            if(c){
                crHandler('xxx');
                $.ajax({
                    type: 'POST',
                    url: '/rooms',
                    data: JSON.stringify({room_name: r, teacher: t, alumns: a}),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Content-type", "application/json");
                    },
                    success: function (res) {
                        crHandler('success');
                    },
                    error: function (res) {
                        if(res.status == 409) crHandler('room-exists');
                    }
                });
            }
        });

    });

    $('#add-alumn-cr').click(function() {
        var a = $('#alumns').val();
        if(a.length = 0) return;
        $.ajax({
            type: 'GET',
            url: '/users/' + a + '?role=alumn',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Content-type", "application/json");
            },
            error: function (res) {
                crHandler('alumn-404');
            },
            success: function (res) {
                var f = false;
                $('#loaded-alumns li').each(function(){
                    if($(this).text() == a){
                        f = true;
                    }
                });
                if(f) return;
                $('#loaded-alumns').show();
                $('#loaded-alumns').append($('<li>', {text: a}));
                $('#alumns').val('');
            }
        });
    });

    $('#alumns').keydown(function(e){
        if(e.which == 13){
            var a = $('#alumns').val();
            if(a.length = 0) return;
            $.ajax({
                type: 'GET',
                url: '/users/' + a + '?role=alumn',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Content-type", "application/json");
                },
                error: function (res) {
                    crHandler('alumn-404');
                },
                success: function (res) {
                    var f = false;
                    $('#loaded-alumns li').each(function(){
                        if($(this).text() == a){
                            f = true;
                        }
                    });
                    if(f) return;
                    $('#loaded-alumns').show();
                    $('#loaded-alumns').append($('<li>', {text: a}));
                    $('#alumns').val('');
                }
            });
        }
        if(e.which == 40){
            $('#alumn-suggestion li').first().focus();
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
        if(e.which == 13 || e.which == 40) return;
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