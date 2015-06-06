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
      this.setPosition();
      this.el.addClass('open');
      this.triggerElement.one('mouseleave', this.close.bind(this));
    },

    setPosition: function() {
      
      var rect = this.el[0].getBoundingClientRect();
      var popover = {
        w: rect.width,
        h: rect.height
      };

      var offset = this.triggerElement.offset();
      var rect = this.triggerElement[0].getBoundingClientRect();
      var triggerElement = {
        x: offset.left,
        y: offset.top,
        w: rect.width,
        h: rect.height
      };

      this.el.css({
        left: triggerElement.x - popover.w / 2 + triggerElement.w / 2,
        top: triggerElement.y - popover.h - 8
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