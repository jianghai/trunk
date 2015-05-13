define([
  'jquery',
  'trunk',
  'vjs',
  'Popover'
], function($, Trunk, vjs, Popover) {

  var title = new Trunk.View({
    tag: 'div',
    template: vjs('<#- data.text #>'),
    className: 'title'
  });

  var popover = new Popover({
    child: title
  });

  $('body').on('mouseenter', '.title', function(e) {
    var target = $(e.currentTarget);
    var text = target.attr('data-title');
    if (!text) return;
    popover.trigger = target;
    title.model.reset({
      text: text
    });
  });

  return title;
});