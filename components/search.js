define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

  });

  var View = Trunk.View.extend({

    model: Model,

    el: '.search',

    template: '#template-search',

    events: {
      'keyup .input-text': 'onKeyup',
      'submit': 'onSubmit',
      'click .clear': 'onClear',
    },

    onKeyup: function(e) {
      var value = e.target.value;
      // if ($.trim(value)) {
      //   this.el.addClass('clear');
      // }
      if (this.searched && value === '') this.clear();
    },

    onClear: function() {
      this.clear();
    },

    clear: function(value) {
      value || (value = '');
      this.el.removeClass('clear');
      this.model.set('value', value);
      this.trigger('search', value);
      this.searched = false;
    },

    onSubmit: function(e) {
      e.preventDefault();
      this.searched = true;
      var form = $(e.target);
      var input = $(form[0].keyword);
      var kw = input.val();
      if (!kw) return input.focus();

      this.model.data.value = kw;

      this.trigger('search', $.trim(kw));
    }
  });

  return View;
});