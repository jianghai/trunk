define([
  'jquery',
  'base',
  'echarts',
  'app'
], function($, base, echarts, app) {

  var Model = base.Model.extend({

    fill: function(res) {
      var _this = this;

      var stores = {};
      res.stores && $.each(res.stores, function() {
        stores[this[_this.group]] = this;
      });

      res.stores = [];

      var begin = new Date(this.param.begin);
      var end = new Date(this.param.end);
      var i = 0;
      while (begin <= end) {
        var format = $.format.date(begin, 'yyyy-mm-dd');
        var empty = {};
        empty[_this.group] = format;
        res.stores[i] = stores[format] || empty;
        begin.setDate(begin.getDate() + 1);
        i++;
      }
    },

    getSingleData: function(col, store) {
      return store[col];
    },

    getSingleCategory: function(val) {
      return val;
    },

    parse: function(data) {
      var d = new Date(this.param.begin);
      d.setDate(d.getDate() + 1);
      d < this.param.end && this.fill(data);
      var _this = this;
      var _category = [];
      var _series = {};
      var _legend = [];
      typeof this.cols === 'function' && (this._cols = this.cols());
      $.each(this._cols || this.cols, function() {
        _series[this.col] = {
          name: this.name,
          type: 'line',
          smooth:true,
          itemStyle: {
            normal: {
              areaStyle: {
                type: 'default'
              }
            }
          },
          data: []
        };
      });

      $.each(data.stores || [], function(i, store) {
        $.each(_series, function(col) {
          this.data.push(col in store ? _this.getSingleData(col, store) : '0');
        });
        _category.push(_this.getSingleCategory(store[_this.group]));
      });

      _series = $.map(_series, function(serie) {
        return serie;
      });

      return {
        category: _category,
        series: _series
      };
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        x: 50,
        y: 30,
        x2: 40,
        y2: 30
      },
      backgroundColor: 'null',
      color: ['#dd515c', '#22beef'],
      xAxis: [{
        type: 'category',
        boundaryGap: false,
        axisLine: {
          show: false
        },
        axisTick: {
          lineStyle: {
            color: '#c6c6c6'
          }
        }
      }],
      yAxis: [{
        type: 'value',
        boundaryGap: [0, .2],
        axisLine: {
          show: false
        },
        splitNumber: 5,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,.03)', 'rgba(0,0,0,0)']
          }
        }
      }, {
        type: 'value',
        boundaryGap: [0, .2],
        axisLine: {
          show: false
        },
        splitNumber: 5,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,.03)', 'rgba(0,0,0,0)']
          }
        }
      }],
      series: []
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.xAxis[0].data = data.category;

      var _legend = [];
      $.each(data.series, function(i) {
        _legend.push(this.name);
        var series = option.series;
        if (!series[i]) {
          series[i] = {};
        }
        $.extend(series[i], this);
      });
      if (!option.legend) {
        option.legend = {};
      }
      if (!option.legend.data) {
        option.legend.data = _legend;
      }

      return option;
    },

    render: function() {
      this.chart && this.chart.clear();
      this.chart = echarts.init(this.el[0]);
      this.chart.setTheme(app.echartsTheme);
      this.chart.setOption(this.parseOption(this.model.data));
    }
  });

  return View;
});