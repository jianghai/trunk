define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend();

  return Trunk.View.extend({

    Model: Model,

    tag: 'div',

    className: 'dialog',

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
      // this.isOpen = false;
      // this.isShow = false;
      this.el.removeClass('open');
    },

    open: function() {
      // this.isOpen = true;
      this.el.addClass('open');
    },

    // waiting: function(msg) {
    //   if (this.isOpen) return;
    //   this.create();
    //   this.el.html('<div class="loading">' + (msg || '加载中，请稍侯') + '<div>');
    //   this.open();
    // },

    show: function() {
      this.render();
      this.$('.dialog-body').html(this.child.el);
      this.child.delegateEvents();
      (this.wapper || $('body')).append(this.el);
      this.open();
      // if (this.isShow) return;
      // // console.log('dialog render');
      // this.create();
      // this.render();
      // this.child.delegateEvents();
      // this.$('.dialog-body').html(this.child.el);
      // this.open();
      // this.isShow = true;
    },

    // create: function() {
    //   if (!this.layer) {
    //     this.layer = $('<div>', {
    //       'class': 'dialog-layer close'
    //     });
    //     (this.wapper || $('body')).append(this.layer);
    //     this.layer.append(this.el);
    //   }
    // },

    init: function() {
      if (this.child) {
        
        this.child.dialog = this;
        
        if (this.child.model && this.child.model.url) {
          // this.listen(this.child.model, 'request', this.waiting);
          this.listen(this.child.model, 'error', this.show);
        }
          
        this.listen(this.child, 'render:after', this.show);
      }
    }
  });
});