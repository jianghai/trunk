define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend();

  return Trunk.View.extend({

    Model: Model,

    stat: {
      // Save the number of open
      opens: 0
    },

    tag: 'div',

    className: 'dialog',

    template: '#template-dialog',

    events: {
      'click': 'onClick',
      'click .dialog-close': 'close'
    },

    onClick: function(e) {
      if ($(e.target).hasClass('dialog-container')) {
        this.close();
      }
    },

    close: function() {
      --this.stat.opens || this.doc.removeClass('dialog-open');
      this.el.removeClass('open');
      this.trigger('close');
    },

    open: function() {
      this.stat.opens++;
      this.doc.addClass('dialog-open');
      this.el.addClass('open');
    },

    show: function() {
      this.render();
      this.$('.dialog-body').html(this.child.el);
      this.child.delegateEvents();
      (this.wapper || this.body).append(this.el);
      this.open();
    },

    init: function() {

      this.body = $('body');
      this.doc = $('html');
      
      if (this.child) {

        this.child.dialog = this;

        // if (this.child.model && this.child.model.url) {
        //   this.listen(this.child.model, 'error', this.show);
        // }

        this.listen(this.child, 'render:after', this.show);
      }
    }
  });
});