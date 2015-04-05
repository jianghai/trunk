/**
 * Fixed dom element position when cliped by scrolling
 */
define(function() {
  var _body = $('body');
  var _pin, _top;

  $(window).scroll(function(e) {
    var _scrollTop = _body.scrollTop();

    if (!_pin || !_pin.is(':visible')) {
      _pin = $('.pin');
      if (_pin.length) {
        _top = _pin.offset().top;
      }
    }

    if (_scrollTop > _top) {
      !_pin.attr('style') && _pin.css({
        position: 'fixed',
        top: 0
      });
    } else {
      _pin.removeAttr('style');
    }
  });
});