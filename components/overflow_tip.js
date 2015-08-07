define([
  'jquery',
  'title'
], function($, title) {

  $('body').on('mouseenter', '.text-overflow', function(e) {
    var target = $(e.currentTarget)
    if (target[0].offsetWidth < target[0].scrollWidth) {
      title.popover.triggerElement = target
      title.model.reset({
        text: target.text()
      })
    }
  })

});