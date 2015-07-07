define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    setParam: function(param, fetch) {
      this.param || (this.param = {});
      typeof param === 'object' && $.extend(this.param, param) || (this.param[param] = fetch);
      fetch !== false && this.fetch();
    },

    onFetch: function(res) {
      this.reset(typeof this.parse === 'function' && this.parse(res) || res);
    },

    ajaxManager: {},

    fetch: function() {
      var self = this;
      this.trigger('request');

      // setTimeout(function() {
        // this.ajaxManager[this.url] && this.ajaxManager[this.url].abort();
        // this.ajaxManager[this.url] = $.ajax({
        $.ajax({
          url: self.url,
          data: self.param && $.param(self.param, true),
		      // dataType:'json'
        }).done(function(res) {
          self.trigger('request:done');
          if (res === '' || (self.isEmpty && self.isEmpty(res))) {
            return self.trigger('empty');
          }
          self.trigger('sync', res);
          self.onFetch(res);
        }).fail(function(xhr, text_status) {
          text_status !== 'abort' && self.trigger('error');
          self.data = self.defaults;
        });
      // }, 0);
    }
  });


  var View = Trunk.View.extend({

    model: Model,

    template_loading: $('#template-loading').html(),
    template_error: $('#template-error').html(),
    template_noData: $('#template-noData').html(),

    loading: function() {
      this.requestTip && this.requestTip.remove();
      this.requestTip = $(this.template_loading);
      this.el.append(this.requestTip);
      // this.el.html(this.template_loading);
    },

    error: function() {
      this.requestTip && this.requestTip.remove();
      this.requestTip = $(this.template_error);
      this.el.append(this.requestTip);
      // this.el.html(this.template_error);
    },

    empty: function() {
      this.requestTip && this.requestTip.remove();
      this.requestTip = $(this.template_noData);
      this.el.append(this.requestTip);
      // this.el.html(this.template_noData);
    },

    beforeRender: function() {
      this.requestTip && this.requestTip.remove();
    },

    init: function() {
      this.listen(this.model, 'request', this.loading);
      this.listen(this.model, 'error', this.error);
      this.listen(this.model, 'empty', this.empty);
    }
  });

  return {
    Model: Model,
    View: View
  };
});