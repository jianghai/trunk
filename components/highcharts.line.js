define([
  'jquery',
  'base',
  'highcharts',
], function($, base) {

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
      if (this.param) {
        var d = new Date(this.param.begin);
        d.setDate(d.getDate() + 1);
        d < this.param.end && this.fill(data);
      }
      var _this = this;
      var _category = [];
      var _series = {};
      typeof this.cols === 'function' && (this._cols = this.cols());
      $.each(this._cols || this.cols, function() {
        _series[this.col] = {
          name: this.name,
          data: []
        };
      });

      $.each(data.stores || [], function(i, store) {
        $.each(_series, function(col) {
          this.data.push(col in store ? _this.getSingleData(col, store) : 0);
        });
        _category.push(_this.getSingleCategory(store[_this.group]));
      });

      _series = $.map(_series, function(serie) {
        return serie;
      });

      return {
        categories: _category,
        series: _series
      };
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      chart: {
        marginTop: 15,
        type: 'line',
        style: {
          fontFamily: 'Arial "Microsoft Yahei"'
        }
      },
      title: {
        text: null
      },
      legend: {
        itemStyle: {
          fontWeight: 'normal',
          color: '#333'
        }
      },
      plotOptions: {
        series: {
          marker: {
            fillColor: '#FFFFFF',
            lineWidth: 2,
            lineColor: null // inherit from series
          }
        }
      },
      tooltip: {
        shared: true
      },
      credits: {
        enabled: false
      },
      colors: ['#2ec7c9', '#5ab1ef', '#ffb980', '#eea03b', '#eee55a', '#8e9cbc', '#b0ce6b', '#48a935', '#956d95', '#dc69aa', '#E0585A', '#333'],
      xAxis: {
        gridLineWidth: 1
      },
      yAxis: {
        title: {
          text: null
        },
        min: 0,
        allowDecimals: false
      },
      series: []
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.xAxis.categories = data.categories;

      $.extend(true, option.series, data.series);
      // option.series = data.series;

      return option;
    },

    render: function() {
      this.el.highcharts(this.parseOption(this.model.data));
    }
  });

  return View;
});