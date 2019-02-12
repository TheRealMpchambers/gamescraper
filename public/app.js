$(document).ready(function() {
    $.getJSON('/articles', function (data) {
        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<div class='card'> <div class='card-header'> "  + data[i].headline + "</div> <div class='card-body'> <p class='card-text'>" + data[i].summary + "<br />" + data[i].link + "</p><button type='button' class='btn btn-dark commentBtn' data-toggle='modal' data-target='#commentModal' data-id ='" + data[i]._id + "'>Comment</button></div>");
        }
        $('.commentBtn').click(function(event) {
            event.preventDefault();
            $('#commentTitle').empty();
            $('#commentHeadline').empty();
            $('#commentBody').empty();
            $('#commentSave').empty();

            var thisId = $(this).attr('data-id');
            console.log('clicked')
            console.log('thisid');

            $.ajax({
                    method: 'GET',
                    url: '/articles/' + thisId
                })
                .then(function (data) {
                    console.log(data);
                    $('#commentHeadline').append('<h2>' + data.headline + '</h2>');
                    $('#commentTitle').append('<input type="text" class="form-control" id="titleInput" name="title">');
                    $('#commentBody').append('<textarea class="form control" id="bodyInput" name="body"></textarea>');
                    $('#commentSave').append('<button type="button" class="btn btn-danger" data-id="' + data._id + '" id="saveNote">Save Comment</button>');

                    if (data.note) {
                        $('#titleinput').val(data.note.title);
                        $('#bodyinput').val(data.note.body);
                    }
                });
        });
    });

    $('#scraper').click(function(event) {
        event.preventDefault();
        $.get('/scrape').then(function (data) {
            console.log('pressed');
            console.log(data);
        });
    });

    $(document).on('click', '#savenote', function () {
        let thisId = $(this).attr('data-id');

        $.ajax({
                method: "POST",
                url: '/articles/' + thisId,
                data: {
                    title: $('#titleinput').val(),
                    body: $('#bodyinput').val()
                }
            })
            .then(function (data) {
                console.log(data);
                $('#notes').empty();
            });
        $('#titleinput').val('');
        $('#bodyinput').val('');
    });

});