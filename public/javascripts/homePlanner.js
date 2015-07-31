function crHandler(code){
    $('.alumns').css('borderColor','');
    $('.teacher').css('borderColor','');
    $('#room-name').css('borderColor','');
    $('#loaded-alumn').css('borderColor','');
    $('#create-room-error').hide();
    $('#create-room-success').hide();

    switch (code) {
        case 'room-short':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('Room name length must be longer than 6 characters');
            $('#create-room-error').show();
            break;
        case 'teacher-404':
            $('.teacher').css('borderColor','red');
            $('#create-room-error').html('Unknown teacher');
            $('#create-room-error').show();
            break;
        case 'alumns-void':
            $('#loaded-alumn').css('borderColor','red');
            $('#create-room-error').html('Void alumn list');
            $('#create-room-error').show();
            break;
        case 'alumn-404':
            $('.alumns').css('borderColor','red');
            $('#create-room-error').html('Unknown alumn');
            $('#create-room-error').show();
            break;
        case 'room-exists':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('Room name already exists');
            $('#create-room-error').show();
            break;
        case 'success':
            $('#create-room-success').show();
            $('.alumns').val('');
            $('.teacher').val('');
            $('#room-name').val('');
            $('#loaded-alumns').empty();
            break;
        case 'excess':
            $('#create-room-error').html('No more than 20 alumns per room allowed');
            $('#create-room-error').show();
            break;
        case '500':
            $('#create-room-error').html('Internal server error, try it later');
            $('#create-room-error').show();
            break;
    }
}

function menuHandler(){
    $('#create-room').hide();
    $('#delete-room-selector').hide();
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

function processData(allText) {
    var lines = allText.split(/\r\n|\n/);
    return lines;
}

function createfunc(a) {
    return function() { $.ajax({
        type: 'GET',
        url: '/users/' + a + '?role=alumn',
        success: function (res) {
            var f = false;
            $('#loaded-alumns li').each(function () {
                if ($(this).text() == a) {
                    f = true;
                }
            });
            if (f) return;
            if ($('#loaded-alumns li').length > 19){
                crHandler('excess')
                return;
            }
            $('#loaded-alumns').show();
            $('#loaded-alumns').append($('<li>', {text: a}));
        }
    });};
}

function fileHandler(files){
    var file = files[0];
    var r = new FileReader();
    r.onload = function(e) {
        var contents = e.target.result;
        var lines = processData(contents);
        var stack = [];
        for(var i in lines) {
            var a = lines[i];
            if (a.length == 0) return;
            //Preserve line order
            stack[i]=createfunc(a);
            stack[i]();
        }

    }
    r.readAsText(file);
}

$(document).ready(function() {
    $('#create-room-show').click(function () {
        menuHandler();
        $('#create-room').show();
    });

    $('#delete-room-show').click(function () {
        $('#delete-room-select').empty();
        menuHandler();
        $('#delete-room-selector').show();
        $.ajax({
            type: 'GET',
            url: '/rooms',
            success: function (list, e, jqXHR) {
                console.log(list);
                for (var i in list.rooms) {
                    console.log(list.rooms[i]);
                    $('#delete-room-select').append($('<option>', {
                        text: list.rooms[i].room_name + ' - Prof. ' + list.rooms[i].teacher,
                        data_room: list.rooms[i].licode_room
                    }));
                }
            },
            error: function (a, e, jqXHR) {
                console.log('error');
            }
        });
    });

    $('#delete-room').click(function(e){
        var r = $("#delete-room-select option:selected").attr('data_room');
        console.log(r);
        $.ajax({
            type: 'DELETE',
            url: '/rooms/'+ r,
            success: function (a, e, jqXHR) {
                $("#delete-room-select option:selected").remove();
            }
        });
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
        var t = $('.teacher').val();
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
        var a = $('.alumns').val();
        if(a.length = 0) return;
        console.log(a);
        $.ajax({
            type: 'GET',
            url: '/users/' + a + '?role=alumn',
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
                $('.alumns').val('');
            }
        });
    });




    $('.teacher').keyup(function(e){
        crHandler();
        e.preventDefault();
        if(e.which == 13 || e.which == 40 || e.which == 39 || e.which == 38) return;
        var pattern = $('.teacher').val();
        $.ajax({
            type: 'GET',
            url: '/users?role=teacher&pattern=' + pattern,
            success: function (res) {
                $('#teacher-suggestion').hide();
                $('#teacher-suggestion').empty();
                for(var i in res.users) {
                    $('#teacher-suggestion').append($('<option>', {value: res.users[i]}));
                }
                $('#teacher-suggestion').show();
            },
        });
    });


    $('.alumns').keyup(function(e){
        crHandler();
        e.preventDefault();
        if(e.which == 13){
            var a = $('.alumns').val();
            if(a.length = 0) return;
            $.ajax({
                type: 'GET',
                url: '/users/' + a + '?role=alumn',
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
                    if ($('#loaded-alumns li').length > 19){
                        crHandler('excess')
                        return;
                    }
                    $('#loaded-alumns').show();
                    $('#loaded-alumns').append($('<li>', {text: a}));
                    $('.alumns').val('');
                }
            });
        }else if(e.which == 40 || e.which == 39 || e.which == 38) return;
        else {
            var pattern = $('.alumns').val();
            $.ajax({
                type: 'GET',
                url: '/users?role=alumn&pattern=' + pattern,
                success: function (res) {
                    $('#alumn-suggestion').empty();
                    $('#alumn-suggestion').hide();
                    for (var i in res.users) {
                        $('#alumn-suggestion').append($('<option>', {value: res.users[i]}));
                    }
                    $('#alumn-suggestion').show();
                }
            });
        }
    });

});