var controller;
var cnt;

$(function(){

    cnt = $('.carousel-item').length > 6 ? 6 : $('.carousel-item').length;

    /*Particles.init({
        selector: '.background',
        color: '#aaaaaa',
        connectParticles: true,
        speed: 0.2
    });*/

    controller = new ScrollMagic.Controller();

    var scenes = [
        'about',
        'management',
        'business',
        'partners',
        'contacts',
    ];

    for (var key in scenes) {
        new ScrollMagic.Scene({triggerElement: '#' + scenes[key]})
            .setClassToggle('[scrollTo=' + scenes[key] + ']', 'active')
            .addTo(controller)
            .triggerHook(0.2)
            .duration($('#' + scenes[key]).height())
        ;
    }

    new WOW().init();

    checkCarousel();
    onScroll();
    $(window).on('resize', function () {
        checkCarousel();
    });
    $(window).on('scroll', function () {
        onScroll();
    });

    $('a[scrollTo]').on('click', function () {
        var position = $($(this).attr('href')).offset();
        position.top = position.top - 100;
        $.scrollTo({top: position.top, left: 0}, 1000);

        $('.hamburger').removeClass('open');
        $('.menu').removeClass('open');

        return false;
    });

    $('.hamburger').on('click', function () {
        $(this).toggleClass('open');
        $('.menu').toggleClass('open');
    });
});

function checkCarousel()
{
    var carousel = $('.owl-carousel');
    var mobile = $(window).width() < 843;


    if (!mobile && carousel.data('rendered') != true) {
        carousel.data('rendered', true).owlCarousel({
            items:cnt,
            loop:true,
            nav: true,
            navText: ['', '']
        });
    }

    if (mobile && carousel.data('rendered') == true) {
        carousel.data('rendered', false).owlCarousel('destroy');
    }
}

var sending = false;
function request(btn)
{
    if (sending) {
        return false;
    }
    sending = true;

    var params = {
        name: $('[name=name]').val(),
        email: $('[name=email]').val(),
        question: $('[name=question]').val(),
    };

    if (
        params.name == '' ||
        params.email == '' ||
        params.question == ''
    ) {
        btnAlert(btn, 'fill the fields', '#ffb22b');
        sending = false;
        return false;
    }

    //inside folder
    $.post('api.php', {action:'request', params:params}, function (data) {
        if (data.success) {
            btnAlert(btn, 'Sended', '#06d79c');
        } else {
            btnAlert(btn, 'Error', '#ffb22b');
        }
        sending = false;
    }, 'json');
}

function btnAlert(btn, text, color,)
{
    btn.data('text', btn.text());
    btn.text(text).css({'background-color': color});
    var change = function () {
        btn.text(btn.data('text')).removeAttr('style');
    }
    setTimeout(change, 1000);
}

function onScroll()
{
    var btn = $('.link__about');

    if ($(window).scrollTop() == 0) {
        btn.css({'opacity': 1});
    } else {
        btn.css({'opacity': 0});
    }
}

