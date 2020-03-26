    maximumHeight = (($(window).height() - $('#mynavbar').height()));
    $('#container1').css('max-height', (maximumHeight - 13) + 'px');

    $(window).resize(function () {
        maximumHeight = (($(window).height() - $('#mynavbar').height()));
        $('#container1').css('max-height', (maximumHeight - 13) + 'px');
    });

    $.each(persons, function (i, person) {
        $('#personsHere').append('<li class="list-group-item"><b>'+ person.name + ':</b> ' + person.description + '</li>')
    });
