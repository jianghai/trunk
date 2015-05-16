define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend();

  return Trunk.View.extend({

    Model: Model,

    template: '#template-select',

    onRequest: function() {
      this.el.html('<option value="">加载中</option>');
    },

    onError: function() {
      this.el.html('<option value="">服务器错误，请重试</option>');
    }
  });
});