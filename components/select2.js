define([
  'jquery',
  'trunk',
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    cache: {},

    init: function() {
      var _this = this;
      if (this.url) {
        this.onFetch = function(res) {
          this.reset({
            items: $.map(res, function(v) {
              return {
                key: v,
                value: v
              };
            })
          });
        };

        this.fetch = function() {
          var _url = this.url + '?' + $.param(this.param);
          if (this.cache[_url]) {
            _this.onFetch(this.cache[_url]);
          } else {
            $.get(this.url, this.param, function(res) {
              _this.cache[this.url] = res;
              _this.onFetch(res);
            });
          }
        };
      }
    }
  });

  var View = Trunk.View.extend({

    model: Model,

    template: '#template-select',

    events: {
      'change': 'onChange'
    },

    onChange: function(e) {
      var target = $(e.target);
      this.trigger('change', target.val());
    }
  });

  return View;
});