define([
  'trunk',
  'dialog'
], function(Trunk, Dialog) {

  return new Trunk.View({

    model: new Trunk.Model(),

    tag: 'div',

    className: 'success',

    template: '#template-success',

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