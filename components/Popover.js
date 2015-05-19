define([
  'jquery',
  'trunk'
], function($, Trunk) {

  return Trunk.View.extend({

    tag: 'div',

    className: 'popover',

    open: function() {
      this.el.css('left', 0);
      this.el.html(this.child.el);
      // this.child.delegateEvents();
      this.setPosition();
      this.trigger.one('mouseleave', this.close.bind(this));
      this.el.addClass('open');
    },

    setPosition: function() {
      
      var rect = this.el[0].getBoundingClientRect();
      var popover = {
        w: rect.width,
        h: rect.height
      };

      var offset = this.trigger.offset();
      var rect = this.trigger[0].getBoundingClientRect();
      var trigger = {
        x: offset.left,
        y: offset.top,
        w: rect.width,
        h: rect.height
      };

      this.el.css({
        left: trigger.x - popover.w / 2 + trigger.w / 2,
        top: trigger.y - popover.h - 8
      });
    },

    close: function() {
      this.el.removeClass('open');
    },

    init: function() {

      this.child.popover = this;

      (this.wapper || $('body')).append(this.el);

      this.listen(this.child, 'render:after', this.open);
    }
  });

});