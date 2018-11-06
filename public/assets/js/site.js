var GRECAPTCHA = '6Le-YXgUAAAAANQykgT1H_2-KqfsG8-CMxrqacKQ';

var controller;
var cnt;

$(function() {
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

    $("#feedback_form").on('submit', onFeedbackSubmit);
    $('#research_link').on('click', onResearchOpen);
    $('#research_form').on('submit', onResearchSubmit);
    $('#research .close').on('click', onResearchClose);
});

function checkCarousel() {
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

function btnAlert(btn, text, color) {
    btn.data('text', btn.text());
    btn.text(text).css({'background-color': color});
    var change = function () {
        btn.text(btn.data('text')).removeAttr('style');
    }
    setTimeout(change, 1000);
}

function onScroll() {
    var btn = $('.link__about');

    if ($(window).scrollTop() == 0) {
        btn.css({'opacity': 1});
    } else {
        btn.css({'opacity': 0});
    }
}

function onFeedbackSubmit(event) {
    event.preventDefault();
    var $form = $(this),
        $title = $('#form_title');
    if ($form.attr('novalidate')) {
        $form.removeAttr('novalidate');
        $form.get(0).reportValidity();
        return;
    }
    if ($form.attr('disabled')) {
        return;
    }
    $form.attr('disabled', true);

    grecaptcha.ready(function() {
        grecaptcha.execute(GRECAPTCHA, {action: 'feedback'})
            .then(function(token) {
                var data = $form.serializeArray();
                data.push({name: 'gtoken', value: token});
                $.post('/feedback', $.param(data))
                    .then(function() {
                        $form.hide();
                        $form.trigger('reset');
                        $form.attr('disabled', false);
                        $form.attr('novalidate', 'novalidate');
                        $title.text($title.data('success'));
                    }).catch(function() {
                        $form.attr('disabled', false);
                    });
            });
        });
}

function onResearchOpen(event) {
    event.preventDefault();
    var $dialog = $('#research'),
        dialog = $dialog.get(0);
    dialog.show ?
        dialog.show() :
        $dialog.show(); // WORKAROUND for non-supporting browsers.

    var offset = (document.documentElement.clientHeight - $dialog.outerHeight()) / 2;
    // NOTE header height.
    offset = offset < 0 ? 0 : offset;
    $dialog.css({marginTop: offset + 'px'});

    var $btn = $('.btn', $dialog);
    $btn.attr('value', $btn.data('default'));

    $('.link__about').css({'opacity': 0, visibility: 'hidden'});
    $('.page').slice(1).hide();
    $('footer').hide();
    controller.enabled(false);
    // WORKAROUND for ScrollMagic.
    $('#header .menu .active').removeClass('active');
}

function onResearchSubmit(event) {
    event.preventDefault();
    var $form = $(this);
    if ($form.attr('novalidate')) {
        $form.removeAttr('novalidate');
        $form.get(0).reportValidity();
        return;
    }
    if ($form.attr('disabled')) {
        return;
    }
    $form.attr('disabled', true);

    grecaptcha.ready(function() {
        grecaptcha.execute(GRECAPTCHA, {action: 'feedback'})
            .then(function(token) {
                var data = $form.serializeArray();
                data.push({name: 'gtoken', value: token});
                $.post('/ton', $.param(data))
                    .then(function() {
                        var $btn = $('.btn', $form);
                        $btn.attr('value', $btn.data('success'));
                        setTimeout(onResearchClose, 2000);
                    }).catch(function() {
                        $form.attr('disabled', false);
                    });
            });
    });
}

function onResearchClose() {
    var $dialog = $('#research'),
        dialog = $dialog.get(0),
        $form = $('#research_form');

    dialog.close ?
        dialog.close() :
        $dialog.hide();

    $form.trigger('reset');
    $form.attr('disabled', false);
    $form.attr('novalidate', 'novalidate');

    $('.hamburger').removeClass('open');
    $('.menu').removeClass('open');

    $('.link__about').css({'opacity': 1, visibility: 'visible'});
    $('.page').show();
    $('footer').show();
    controller.enabled(true);
    // WORKAROUND for ScrollMagic.
    $('#header .menu .active').removeClass('active');
}
