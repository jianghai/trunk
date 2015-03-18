define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var View = Trunk.View.extend({

    template: vjs($('#template-autocomplete').html()),

    events: {
      'input input': 'onInput'
    },

    onInput: function() {

      this.show();
    },

    render: function() {
      this.$('.search_result').html(this.template(this.model.data));
    }
  });
});