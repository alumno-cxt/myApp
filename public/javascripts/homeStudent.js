function resetView(){
    $('#video-select').empty();
    $('#my-select').empty();
    $('.current-menu-item').removeClass('current-menu-item');
    $('#room-selector').hide();
    $('#update').hide();
    $('#video-selector').hide();
    $('#playit').hide();
    $('#playit').empty();
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

$(document).ready(function() {
    $('#home').click(function(){
        resetView();
        $('#home').addClass('current-menu-item');
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

    $('#show-update').click(function () {
        resetView();
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
        formData = {};
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

    $('#videos').click(function () {
        resetView();
        $('#videos').addClass('current-menu-item');
        $('#video-selector').show();
        $.ajax({
            type: 'GET',
            url: '/videos',
            success: function (list) {
                for (var i in list.videos) {
                    $('#video-select').append($('<option>', {
                        text: list.videos[i].room_name +' - Teacher: '+ list.videos[i].teacher + " on " + list.videos[i].rec_date,
                        data_teacherId: list.videos[i].teacher_video, data_screenId: list.videos[i].screen_video
                    }));
                }
            }
        });
    });

    $('#load-video').click(function(e){
        var t = $("#video-select option:selected").attr('data_teacherId');
        var s = $("#video-select option:selected").attr('data_screenId');
        console.log(t,s);
        if(t !== undefined){
            $('#playit').append($('<video id="tea" src="/videos/'+s+'" type="video/webm" controls></video>'));
            $('#playit').append($('<video id="scr" src="/videos/'+t+'" type="video/webm" controls></video>'));
            $('#tea').get(0).play();
            $('#scr').get(0).play();
            $('#playit').show();
            $('#video-selector').hide();
        }
    });


    $('#rooms').click(function () {
        resetView();
        $('#rooms').addClass('current-menu-item');
        $('#room-selector').show();
        $.ajax({
            type: 'GET',
            url: '/rooms',
            success: function (list, e, jqXHR) {
                console.log(list);
                for (var i in list.rooms) {
                    console.log(list.rooms[i]);
                    $('#my-select').append($('<option>', {
                        text: list.rooms[i].room_name +' - Teacher: '+ list.rooms[i].teacher, data_room: list.rooms[i].licode_room
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