define([
  'jquery',
  'trunk',
  'highcharts'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    // fill: function(res) {
    //   var _this = this;

    //   var stores = {};
    //   res.stores && $.each(res.stores, function() {
    //     stores[this[_this.group]] = this;
    //   });

    //   res.stores = [];

    //   var begin = new Date(this.param.begin);
    //   var end = new Date(this.param.end);
    //   var i = 0;
    //   while (begin <= end) {
    //     var format = $.format.date(begin, 'yyyy-mm-dd');
    //     var empty = {};
    //     empty[_this.group] = format;
    //     res.stores[i] = stores[format] || empty;
    //     begin.setDate(begin.getDate() + 1);
    //     i++;
    //   }
    // },

    // getSingleData: function(col, store) {
    //   return store[col] ;
    // },

    // getSingleCategory: function(val) {
    //   return val;
    // },

    parse: function(data) {
      var _category = [];
      var _series = typeof this.cols === 'function' ? this.cols() : this.cols;

      _series.forEach(function(serie) {
        serie.data = [];
      });
      
      data.stores.forEach(function(store) {
        _series.forEach(function(serie) {
          serie.data.push(store[serie.key] || 0);
        }, this);
        _category.push(store[this.group]);
      }, this);

      return {
        categories: _category,
        series: _series
      };
    }
  });

  return Trunk.View.extend({

    Model: Model,

    defultOption: {
      chart: {
        marginTop: 30,
        type: 'areaspline',
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
          color: '#747d94'
        }
      },
      tooltip: {
        shared: true
      },
      credits: {
        enabled: false
      },
      colors: ['#69b4ee', '#9574d9'],
      xAxis: {
        gridLineWidth: 1
      },
      yAxis: {
        title: {
          text: null
        }
      }
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.xAxis.categories = data.categories;
      // option.xAxis.labels = {
      //   formatter: function() {
      //     return data.categories[this.value]
      //   }
      // };

      option.series = data.series;

      return option;
    },

    render: function() {
      this.el.highcharts(this.parseOption(this.model.data));
    }
  });
});