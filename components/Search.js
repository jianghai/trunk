define([
  'jquery',
  'trunk'
], function($, Trunk) {

  return Trunk.View.extend({

    events: {
      'input input': 'onInput',
      'submit': 'onSubmit',
      'click .icon-clear': 'onClear',
    },

    onInput: function(e) {
      var value = e.target.value;
      this.trigger('input', value);
      if (value) {
        this.el.addClass('clear');
      } else {
        this.clear()
      }
    },

    onClear: function() {
      this.clear();
    },

    clear: function() {
      this.el.removeClass('clear');
      this.$('input').val('');
      if (this.searched) {
        this.trigger('search', '');
        this.searched = false;
      }
    },

    onSubmit: function(e) {
      e.preventDefault();
      var form = $(e.target);
      var input = form.find('input');
      var kw = input.val();
      if (!kw) return input.focus();
      this.trigger('search', $.trim(kw));
      this.searched = true;
      this.$('input').blur();
    }
  });
});