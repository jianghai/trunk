// This is a task module

define(['jquery'], function($) {
  $('body').on('click', '.tab-item', function(e) {
    var target = $(e.target);
    target.addClass('active').siblings().removeClass('active');
  })
});