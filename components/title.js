define([
  'jquery',
  'trunk',
  'Popover'
], function($, Trunk, Popover) {

  var title = new Trunk.View({
    tag: 'div',
    template: function(data) {
      return data.text
    },
    className: 'popover-title'
  })

  var popover = new Popover({
    child: title
  })

  $('body').on('mouseenter', '[data-title]', function(e) {
    var target = $(e.currentTarget)
    var text = target.attr('data-title')
    if (!text) return
    popover.triggerElement = target
    title.model.reset({
      text: text
    })
  })

  return title
});