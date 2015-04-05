define([
  'trunk',
  'dialog'
], function(Trunk, Dialog) {

  return new Trunk.View({

    model: new Trunk.Model(),

    tag: 'div',

    className: 'confirm',

    template: '#template-confirm',

    events: {
      'click .sure': 'onSure'
    },

    onSure: function() {
      this.callback && this.callback();
      this.dialog.close();
    },

    init: function() {
      this.dialog = new Dialog({
        modelProperty: {
          defaults: {
            title: '确认提示'
          }
        },
        child: this
      });
    }
  });
});