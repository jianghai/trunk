define([
  'trunk',
  'Dialog'
], function(Trunk, Dialog) {

  return new Trunk.View({

    model: new Trunk.Model(),

    tag: 'div',

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