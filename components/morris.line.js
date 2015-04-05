define([
  'base',
  'morris',
  'global',
  'jquery.extend'
], function(base, Morris, global) {

  var Model = base.Model.extend({

    fill: function(res) {

      var isGroupByDay = this.param.end - this.param.begin > 24 * 3600 * 1000;

      if (isGroupByDay) {

        var _this = this;

        var _stores = $.arrayToObject(res.stores, function() {
          return {
            key: this[_this.group],
            value: this
          };
        });

        res.stores = [];

        var d = new Date(this.param.begin);

        // By day
        while (d < this.param.end) {
          var _time = $.format.date(d, 'yyyy-mm-dd');
          res.stores.push(_stores[_time] ? _stores[_time] : {
            time: _time
          });
          d.setDate(d.getDate() + 1);
        }
      }

      return res;
    },

    onFetch: function(res) {
      this.reset(this.fill(res));
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      smooth: false,
      lineColors: global.color,
      parseTime: false
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.element = this.el;

      option.data = data.stores;

      option.xkey = this.model.group;

      option.ykeys = this.getYKeys();

      option.labels = option.ykeys

      return option;
    },

    render: function() {
      this.el.empty();
      Morris.Line(this.parseOption(this.model.data));
    }
  });

  return View;
});