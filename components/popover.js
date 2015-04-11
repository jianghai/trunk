define(function() {

  return {

    timer: {},

    bind: function(option) {

      option = $.extend({
        triggerEvent: 'hover', // or 'click'

        content: function() {}, // or string | node 

        layout: 'vertical' // or 'horizontal'
      }, option);

      var self = this;

      if (!this.isCreated) {
        this.popover = $($('#template-popover').html()).appendTo(option.wapper || $('body'));

        this.popover
          .on('mouseenter', function() {
            clearTimeout(self.timer.mouseout);
          })
          .on('mouseleave', function() {
            if (option.triggerEvent !== 'hover') return;
            self.timer.popOut = setTimeout(function() {
              self.close();
            }, 300);
          })
          .on('click', function(e) {
            e.stopPropagation();
          });
        $('body').on('click', function() {
          self.close();
        });
        this.isCreated = true;
      }

      if (!option.triggers instanceof $) {
        option.triggers = $(option.triggers);
      }
      if (option.triggerEvent === 'hover') {
        option.triggers
          .on('mouseover', function(e) {
            clearTimeout(self.timer.popOut);
            self.timer.mouseover = setTimeout(function() {
              self.trigger($(e.target), option);
            }, 300);
          })
          .on('mouseout', function(e) {
            clearTimeout(self.timer.mouseover);
            self.timer.mouseout = setTimeout(function() {
              self.close();
            }, 300);
          });
      } else {
        option.triggers.on('click', function(e) {
          self.popover.toggleClass('open');
          if (self.popover.hasClass('open')) {
            self.trigger($(e.target), option);
          }
          return false;
        });
      }
    },

    close: function() {
      this.popover.removeClass('open');
    },

    trigger: function(trigger, option) {

      var content = typeof option.content === 'function' ? option.content.apply(this, arguments) : option.content;
      this.popover
        .find('.pop-content')
        .html(content);

      typeof option.onTrigger === 'function' && option.onTrigger.apply(this, arguments);

      this.setPosition(trigger, option);
    },

    setPosition: function(trigger, option) {
      var width = trigger.outerWidth();
      var height = trigger.outerHeight();
      var offset = trigger.offset();
      var win = $(window);
      var winScrollTop = win.scrollTop();
      var winScrollLeft = win.scrollLeft();
      var winWidth = win.width();
      var winHeight = win.height();

      var contentWidth = this.popover.outerWidth();
      var contentHeight = this.popover.outerHeight();

      if (option.layout === 'vertical') {
        var isBottom = offset.top - contentHeight < winScrollTop;

        this.popover.addClass(isBottom ? 'bottom' : 'top');

        var translate = contentWidth > width ? (contentWidth - width) * .2 : 0;
        var popLeft = offset.left - translate;

        if (popLeft < winScrollLeft) {
          popLeft = winScrollLeft;
        } else if (popLeft + contentWidth > winScrollLeft + winWidth) {
          popLeft = winScrollLeft + winWidth - contentWidth;
        }
        this.popover.css({
          left: popLeft,
          top: offset.top + (isBottom ? height : -contentHeight)
        });
        this.popover
          .find('.arrow')
          .css('left', offset.left - popLeft + width / 2);
      } else {
        var isRight = offset.left + width + contentWidth < winScrollLeft + winWidth;

        this.popover.addClass(isRight ? 'right' : 'left');

        var translate = contentHeight > height ? (contentHeight - height) * .2 : 0;
        var popTop = offset.top - translate;

        if (popTop < winScrollTop) {
          popTop = winScrollTop;
        } else if (popTop + contentHeight > winScrollTop + winHeight) {
          popTop = winScrollTop + winHeight - contentHeight;
        }
        this.popover.css({
          left: offset.left + (isRight ? width : -contentWidth),
          top: popTop
        });
        this.popover
          .find('.arrow')
          .css('top', offset.top - popTop + height / 2);
      }
      return this;
    }
  };
});