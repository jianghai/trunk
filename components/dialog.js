define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var View = Trunk.View.extend({

    tag: 'div',

    className: 'dialog-content',

    template: '#template-dialog',

    events: {
      'wheel .scroll': 'onWheel',
      // 'click': 'onClick',
      'click .dialog-close': 'close'
    },

    onWheel: function(e) {
      e.currentTarget.scrollTop -= e.originalEvent.wheelDeltaY;
      return false;
    },

    // onClick: function(e) {
    //     if ($(e.target).hasClass(this.className)) {
    //         this.close();
    //     }
    // },

    close: function() {
      this.isOpen = false;
      this.isShow = false;
      this.layer.addClass('close');
    },

    open: function() {
      this.isOpen = true;
      this.layer.removeClass('close');
      return this;
    },

    waiting: function(msg) {
      if (this.isOpen) return;
      this.ready();
      this.open().el.html('<div class="loading">' + (msg || '加载中，请稍侯') + '<div>');
    },

    show: function() {
      if (this.isShow) return;
      // console.log('dialog render');
      this.ready();
      this.render();
      this.open().$('.dialog-body').html(this.child.el);
      this.isShow = true;
    },

    ready: function() {
      if (!this.layer) {
        this.layer = $('<div>', {
          'class': 'dialog-layer close'
        });
        (this.wapper || $('body')).append(this.layer);
        this.layer.append(this.el);
      }
    },

    init: function() {
      if (this.child) {
        this.child.dialog = this;
        if (this.child.model.url) {
          this.listen(this.child.model, 'request', this.waiting);
          this.listen(this.child.model, 'request:done', this.show);
          this.listen(this.child.model, 'error', this.show);
        } else {
          this.listen(this.child, 'render:before', this.show);
        }
      }
    }
  });

  return View;
});