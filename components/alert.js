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

      // Close on enter
      var doc = $(document);
      var that = this;
      var handle = function(e) {
        e.keyCode == 13 && that.dialog.close();
      };

      this.on('render:after', function() {
        doc.on('keydown', handle);
      });

      this.listen(this.dialog, 'close', function() {
        doc.off('keydown', handle);
      });
    }
  });
});