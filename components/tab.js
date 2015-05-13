define(['jquery'], function($) {
  $('body').on('click', '.tab-heading .tab-item', function(e) {
    var target = $(e.currentTarget);
    var index = target.index();
    var body = target.closest('.tab-heading').next();
    target.addClass('active').siblings().removeClass('active');
    body.find('.tab-item').removeClass('active').eq(index).addClass('active');
    return false;
  });
});