define(['jquery'], function($) {

  $('body').on('mouseenter', '.text-overflow', function(e) {
    var target = $(e.target);
    if (target[0].offsetWidth < target[0].scrollWidth && !target.attr('title')) {
      target.attr('title', target.text());
    }
  });
  
});