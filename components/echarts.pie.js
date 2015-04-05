define([
  'jquery',
  'base',
  'echarts',
  'app'
], function($, base, echarts, app) {

  var Model = base.Model.extend({

    parse: function(data) {
      var _this = this;
      var _series = [];
      var _key = this.cols[0].col;
      $.each(data.stores || [], function() {
        _series.push({
          name: this[_this.group],
          value: this[_this.cols[0].col]
        });
      });
      return {
        name: this.cols[0].name,
        series: _series
      };
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      color: app.color,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {d}%'
      },
      series: [{
        // startAngle: 135,
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        itemStyle: {
          normal: {
            labelLine: {
              length: 10
            }
          }
        }
      }]
    },

    parseOption: function(data) {
      var option = $.extend(true, {}, this.defultOption);
      $.extend(true, option, this.option);

      var _legend = [];
      $.each(data.series, function(i) {
        _legend.push(this.name);
      });
      option.legend || (option.legend = {});
      option.legend.data = _legend;

      option.series[0].name = data.name;
      option.series[0].data = data.series;
      return option;
    },

    render: function() {
      this.chart = echarts.init(this.el[0]);
      this.chart.setOption(this.parseOption(this.model.data));
      this.model.data.series.length && this.chart.setTheme(app.echartsTheme);
    }
  });

  return View;
});