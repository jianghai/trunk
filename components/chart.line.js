define([
  'jquery',
  'base',
  'chart',
  'jquery.extend'
], function($, base, Chart) {

  var Model = base.Model.extend({

    fill: function(res) {

      var isGroupByDay = this.param.end - this.param.begin > 24 * 3600 * 1000;

      if (isGroupByDay) {

        var self = this;

        var _stores = $.arrayToObject(res.stores || [], function() {
          return {
            key: this[self.group],
            value: this
          };
        });

        res.stores = [];

        var d = new Date(this.param.begin);

        // By day
        while (d < this.param.end) {
          var _group = $.format.date(d, 'yyyy-mm-dd');
          var _store = {};
          if (_stores[_group]) {
            _store = _stores[_group];
          } else {
            _store[this.group] = _group;
          }
          res.stores.push(_store);
          d.setDate(d.getDate() + 1);
        }
      }
      return res;
    },

    hex2rgb: function(hex) {
      hex = hex.slice(1);
      var rgb = [];
      var i = 0;
      var step = hex.length === 6 ? 2 : 1;
      while (i < hex.length) {
        rgb.push(parseInt(hex.slice(i, i += step), 16));
      }
      return rgb;
    },

    parse: function(res) {

      this.fill(res);

      var self = this;
      var data = {
        labels: []
      };
      data.datasets = $.map(this.datesets || this.getDatesets(), function(v, i) {
        var rgb = self.hex2rgb(self.color[i]);
        return {
          key: v.key || v,
          label: v.name || v,
          fillColor: 'rgba(' + rgb.join(',') + ', ' + (self.opacity || .2) + ')',
          strokeColor: self.color[i],
          pointColor: self.color[i],
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: self.color[i],
          data: []
        };
      });
      $.each(res.stores, function(i, store) {
        data.labels.push(this[self.group]);
        $.each(data.datasets, function() {
          this.data.push(store[this.key] || 0);
        });
      });

      return data;
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      tooltipFontFamily: "arial, 'Microsoft Yahei'",
      tooltipFontSize: 12,
      tooltipTitleFontSize: 12,
      multiTooltipTemplate: "<%= datasetLabel %>：<%= value %>"
    },

    getOption: function() {

      var option = $.extend(true, {}, this.defultOption, this.option);

      return option;
    },

    render: function() {
      this.el.empty();
      var width = this.el.width();
      var canvas = $('<canvas>');
      this.el.append(canvas);
      canvas.prop('width', width);
      canvas.prop('height', width * .3);
      var ctx = canvas.get(0).getContext("2d");
      new Chart(ctx).Line(this.model.data, this.getOption());
    }
  });

  return View;
});