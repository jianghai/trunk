define([
  'trunk',
  'Dialog'
], function(Trunk, Dialog) {

  return Trunk.View.extend({

    Model: Trunk.Model.extend(),

    tag: 'div',

    className: 'confirm',

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
            icon: 'info',
            title: '确认提示'
          }
        },
        child: this
      });

      this.dialog.el.addClass(this.className);

      this.on('sure', function() {
        this.dialog.close();
      });
    }
  });
});