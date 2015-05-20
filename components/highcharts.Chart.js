define([
  'jquery',
  'trunk',
  'highcharts',
  'highcharts.config',
], function($, Trunk, Highcharts) {

  var Model = Trunk.Model.extend({

  });

  return Trunk.View.extend({

    Model: Model,

    defultOption: {
      chart: {
        marginTop: 30
      },
      title: {
        text: null
      },
      tooltip: {
        shared: true
      },
      credits: {
        enabled: false
      },
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

      option.series.forEach(function(serie) {
        serie.data = [];
      });

      var categories = [];
      
      data.stores.forEach(function(store) {
        option.series.forEach(function(serie) {
          serie.data.push(store[serie.key] || 0);
        }, this);
        categories.push(this.model.getCategory(store));
      }, this);

      option.xAxis.categories = categories;

      return option;
    },

    render: function() {

      this.defultOption.chart.renderTo = this.el[0];

      if (!this.chart) {
        this.chart = new Highcharts.Chart(this.defultOption);
      }

      var data = this.model.data;

      if (!data.code !== 200) {
        this.chart.showLoading('服务器错误，请重试');
      } else if (!data.stores || !data.stores.length) {
        this.chart.showLoading('暂无数据');
      } else {
        this.chart = new Highcharts.Chart(this.parseOption(data));
      }
    }
  });
});