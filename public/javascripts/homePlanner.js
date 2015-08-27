function crHandler(code){
    $('.students').css('borderColor','');
    $('.teacher').css('borderColor','');
    $('#room-name').css('borderColor','');
    $('#loaded-student').css('borderColor','');
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
        case 'students-void':
            $('#loaded-student').css('borderColor','red');
            $('#create-room-error').html('Void student list');
            $('#create-room-error').show();
            break;
        case 'student-404':
            $('.students').css('borderColor','red');
            $('#create-room-error').html('Unknown student');
            $('#create-room-error').show();
            break;
        case 'room-exists':
            $('#room-name').css('borderColor','red');
            $('#create-room-error').html('Room name already exists');
            $('#create-room-error').show();
            break;
        case 'success':
            $('#create-room-success').show();
            $('.students').val('');
            $('.teacher').val('');
            $('#room-name').val('');
            $('#loaded-students').empty();
            break;
        case 'excess':
            $('#create-room-error').html('No more than 20 students per room allowed');
            $('#create-room-error').show();
            break;
        case '500':
            $('#create-room-error').html('Internal server error, try it later');
            $('#create-room-error').show();
            break;
    }
}

function updateHandler(code){
    $('#update-loading').hide();
    $('#update-success').hide();
    $('#update-error').hide();
    $('#update input#email').css('borderColor','');
    $('#update input#pass').css('borderColor','');
    switch (code){
        case 'submit':
            $('#update-loading').show();
            break;
        case 'email':
            $('#update input#email').css('borderColor','red');
            $('#update-error').html('Invalid email format');
            $('#update-error').show();
            break;
        case 'short-pass':
            $('#update input#pass').css('borderColor','red');
            $('#update-error').html('Password length must be between 8 and 25 characters');
            $('#update-error').show();
            break;
        case 'pass':
            $('#update input#pass').css('borderColor','');
            $('#update-error').html('Password must contain at least a number and a uppercase letter');
            $('#update-error').show();
            break;
        case 'success':
            $('#update-success').show();
            $('#update input#pass').val('');
            break;
        case '500':
            $('#update-error').html('Server, error try later');
            $('#update-error').show();
            break;
        case 'duplicate':
            $('#update input#email').css('borderColor','red');
            $('#update-error').html('The email is already registered');
            $('#update-error').show();
            break;
    }
}

function updateValidator(){
    var email = $('#update input#email').val();
    var pass = $('#update input#pass').val();
    console.log(email);
    if(email != '') {
        if (!emailRegex.test($('#update input#email').val())) {
            console.log('email');
            updateHandler('email');
            return 1
        }
    }
    if(pass != '') {
        if (!(7 < pass.length && pass.length < 25)) {
            updateHandler('short-pass');
            return 1
        }

        if (!passRegex.test($('#update input#pass').val())) {
            updateHandler('pass');
            return 1
        }
    }
    return 0;
}

var emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
var passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,25}$/;

function menuHandler(){
    $('#delete-room-select').empty();
    $('.current-menu-item').removeClass('current-menu-item');
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
    return function() {
        $.ajax({
            type: 'GET',
            url: '/users/' + a + '?role=student',
            success: function (res) {
                var f = false;
                $('#loaded-students li').each(function () {
                    if ($(this).text() == a) {
                        f = true;
                    }
                });
                if (f) return;
                if ($('#loaded-students li').length > 19){
                    crHandler('excess')
                    return;
                }
                $('#loaded-students').show();
                $('#loaded-students').append($('<li>', {text: a}));
            }
        });
    };
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
    $('#show-update').click(function () {
        menuHandler();
        $('#home').addClass('current-menu-item');
        $.ajax({
            type: 'GET',
            url: '/users/self',
            success: function (res) {
                console.log(res);
                $('#nick').val(res.nick);
                $('#email').val(res.email);
                $('#role').val(res.role);
                $('#nick').prop('disabled', true);
                $('#role').prop('disabled', true);
                $('#update').show();
            }
        });
    });

    $('#update-form').submit(function(e){
        e.preventDefault();
        var formData = {};
        formData.email = $('#update input#email').val();
        formData.pass = $('#update input#pass').val();
        if(updateValidator()) return;
        updateHandler('submit');
        $.ajax({
            type: 'PUT',
            url: '/users/self',
            data: formData,
            success: function(res){
                updateHandler('success');
            },
            error: function(res){
                if(res.status == 500){
                    updateHandler('500');
                }else{
                    console.log(res);
                    updateHandler('duplicate');
                }
            }
        });
    });

    $('#home').click(function(){
        menuHandler();
        $('#home').addClass('current-menu-item');
    });

    $('#create-room-show').click(function () {
        menuHandler();
        $('#subjects').addClass('current-menu-item');
        $('#create-room').show();
    });

    $('#delete-room-show').click(function () {
        $('#delete-room-select').empty();
        menuHandler();
        $('#subjects').addClass('current-menu-item');
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
        $('#student-suggestion').hide();
        e.preventDefault();
        var a = [];
        var i = 0;
        var x = 0;
        $('#loaded-students li').each(function(e){
            a.push($(this).text());
            x++;
        });
        if(x == 0){
            crHandler('students-void');
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
                    data: JSON.stringify({room_name: r, teacher: t, students: a}),
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

    $('#add-student-cr').click(function() {
        var a = $('.students').val();
        if(a.length = 0) return;
        console.log(a);
        $.ajax({
            type: 'GET',
            url: '/users/' + a + '?role=student',
            error: function (res) {
                crHandler('student-404');
            },
            success: function (res) {
                var f = false;
                $('#loaded-students li').each(function(){
                    if($(this).text() == a){
                        f = true;
                    }
                });
                if(f) return;
                $('#loaded-students').show();
                $('#loaded-students').append($('<li>', {text: a}));
                $('.students').val('');
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


    $('.students').keyup(function(e){
        crHandler();
        e.preventDefault();
        if(e.which == 13){
            var a = $('.students').val();
            if(a.length = 0) return;
            $.ajax({
                type: 'GET',
                url: '/users/' + a + '?role=student',
                error: function (res) {
                    crHandler('student-404');
                },
                success: function (res) {
                    var f = false;
                    $('#loaded-students li').each(function(){
                        if($(this).text() == a){
                            f = true;
                        }
                    });
                    if(f) return;
                    if ($('#loaded-students li').length > 19){
                        crHandler('excess')
                        return;
                    }
                    $('#loaded-students').show();
                    $('#loaded-students').append($('<li>', {text: a}));
                    $('.students').val('');
                }
            });
        }else if(e.which == 40 || e.which == 39 || e.which == 38) return;
        else {
            var pattern = $('.students').val();
            $.ajax({
                type: 'GET',
                url: '/users?role=student&pattern=' + pattern,
                success: function (res) {
                    $('#student-suggestion').empty();
                    $('#student-suggestion').hide();
                    for (var i in res.users) {
                        $('#student-suggestion').append($('<option>', {value: res.users[i]}));
                    }
                    $('#student-suggestion').show();
                }
            });
        }
    });

});