define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    cache: {},

    parse: function() {
      var _this = this;
      this.selected = $.arrayToObject(this.selected || [], function(i, v) {
        return {
          key: v,
          value: 1
        }
      });
      return $.map(this.source || [], function(v, i) {
        return {
          checked: !!_this.selected[v],
          name: v
        };
      });
    },

    init: function() {
      var _this = this;
      if (this.url) {
        this.onFetch = function(res) {
          this.source = res;
          this.reset({
            items: this.parse()
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

    template: '#template-multiSelect',

    events: {
      'click .checkbox': 'onSelect'
    },

    onSelect: function(e) {
      var target = $(e.target);
      var val = target.val();
      var _selected = this.model.selected;
      if (target.prop('checked')) {
        _selected[val] = true;
      } else {
        delete _selected[val];
      }
      this.trigger('change', _selected);
    },

    show: function() {
      if (!this.model.url) {
        this.model.reset({
          items: this.model.parse()
        });
      } else {
        this.model.fetch();
      }
    }
  });

  return View;
});