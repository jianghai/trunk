define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend();

  return Trunk.View.extend({

    Model: Model,

    template: '#template-select',

    loading: function() {
      this.el.html('<option value="">加载中</option>');
    },

    error: function() {
      this.el.html('<option value="">加载错误</option>');
    }
  });
});