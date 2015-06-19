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

      // Close on enter
      var doc = $(document);
      var that = this;
      var handle = function(e) {
        e.keyCode == 13 && that.trigger('sure');
      };

      this.on('render:after', function() {
        $(document.activeElement).blur();
        doc.on('keydown', handle);
      });

      this.listen(this.dialog, 'close', function() {
        doc.off('keydown', handle);
      });
    }
  });
});