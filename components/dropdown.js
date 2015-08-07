define([
  'jquery'
], function($) {

  $('body').on('click', function() {

    $('.dropdown').removeClass('open')

  }).on('click', '.drop-toggle', function(e) {

    var target = $(e.currentTarget)

    // For nested dropdown
    var dropdown = $(e.currentTarget).closest('.dropdown')

    var closestDropdown = dropdown.parent().closest('.dropdown')

    (closestDropdown.length && closestDropdown[0] !== dropdown[0] && closestDropdown || $(document))
    .find('.dropdown').not(dropdown).removeClass('open')

    dropdown.toggleClass('open')

    // position reset
    // if (dropdown.hasClass('open')) {
    //   var o_t = target.offset().top
    //   var layer = target.next()
    //   var _h = layer.outerHeight()
    //   if (o_t - $(window).scrollTop() + target.height() + _h > $(window).height()) {
    //     layer.css('top', '-' + _h + 'px')
    //   } else {
    //     layer.css('top', '100%')
    //   }
    // }

    return false

  }).on('click', '.drop-layer', function(e) {

    e.stopPropagation()

    var target = $(e.currentTarget)

    target.find('.dropdown').removeClass('open')
  })
});