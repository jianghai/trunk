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
      var self = this;
      --this.stat.opens || setTimeout(function() {
        self.el.hide();
        $('html').removeClass('dialog-open');
      }, 300);
      this.el.removeClass('open');
      this.trigger('close');
    },

    open: function() {
      this.stat.opens++;
      $('html').addClass('dialog-open');
      var self = this;
      setTimeout(function() {
        self.el.show().addClass('open');
      }, 150);
    },

    // show: function() {
    //   this.body.html(this.child.el);
    //   this.child.delegateEvents();
    //   this.open();
    // },

    init: function() {

      this.render();

      (this.wapper || $('body')).append(this.el);

      this.listen(this.model, 'change:title', function(title) {
        this.$('.dialog-title').text(title);
      });

      this.$('.dialog-body').append(this.child.el);

      // this.child.delegateEvents();

      this.child.dialog = this;

      this.listen(this.child, 'render:after', this.open);
    }
  });
});