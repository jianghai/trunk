define([
  'trunk',
  'Dialog'
], function(Trunk, Dialog) {

  return Trunk.View.extend({

    Model: Trunk.Model.extend(),

    tag: 'div',

    template: '#template-confirm',

    events: {
      'click .sure': 'onSure'
    },

    onSure: function() {
      this.trigger('sure');
    },

    init: function() {
      this.dialog = new Dialog({
        model: {
          data: {
            title: '确认提示'
          }
        },
        className: 'confirm',
        child: this
      });

      this.dialog.el.addClass(this.className);

      this.on('sure', function() {
        this.dialog.close();
      });
    }
  });
});