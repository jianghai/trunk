define([
  'trunk',
  'dialog'
], function(Trunk, Dialog) {

  return new Trunk.View({

    model: new Trunk.Model(),

    tag: 'div',

    className: 'error',

    template: '#template-dialog-error',

    init: function() {
      new Dialog({
        modelProperty: {
          defaults: {
            title: '提示'
          }
        },
        child: this
      });
    }
  });
});