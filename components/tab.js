define([
  'jquery',
], function($) {

  $('body').on('click', '.tab-navi', function(e) {
    var target = $(e.currentTarget)
    var index = target.index()
    target.addClass('active').siblings().removeClass('active')
    target.closest('.tab').find('.tab-item').removeClass('active').eq(index).addClass('active')
    return false
  })
});