define([
  'trunk',
  'Dialog'
], function(Trunk, Dialog) {

  return new Trunk.View({

    model: new Trunk.Model(),

    tag: 'form',

    events: {
      'submit': 'onSubmit'
    },

    onSubmit: function() {
      this.dialog.close();
      return false;
    },

    className: 'alert',

    template: '#template-alert',

    init: function() {
      new Dialog({
        model: {
          data: {
            title: '提示'
          }
        },
        child: this
      });
    }
  });
});