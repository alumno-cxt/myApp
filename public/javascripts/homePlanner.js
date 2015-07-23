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

    $('#register-form').submit(function (e) {
        e.preventDefault();
        formData = $(this).serialize();
        if (registerValidator()) return;
        registerHandler('submit');
        $.ajax({
            type: 'POST',
            url: '/users',
            data: formData,
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


    $('#teacher').keyup(function(){
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

});