define(['jquery'], function($) {
  $('body').on('click', '.tab-item', function(e) {
    var target = $(e.currentTarget);
    target.addClass('active').siblings().removeClass('active');
  })
});