define([
  'jquery',
  'trunk'
], function($, Trunk) {

  return new Trunk.View({

    tag: 'div',

    className: 'message',

    template: '#template-message',

    events: {
      'click .close': 'close'
    },

    close: function() {
      this.el.removeClass('open');
    },

    open: function() {
      this.el.addClass('open');
      this.model.data.close && setTimeout(this.close.bind(this), 3000);
    },

    init: function() {
      $('body').append(this.el);
      this.on('render:after', this.open);
    }
  });
});