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
      tooltip: {
        shared: true
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
      
      data.forEach(function(store) {
        option.series.forEach(function(serie) {
          serie.data.push(store[serie.key] || 0);
        }, this);
        categories.push(this.model.getCategory ? this.model.getCategory(store) : store[this.model.group]);
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

      if (!data.stores || !data.stores.length) {
        this.el.html('<div class="empty">暂无数据</div>');
      } else {
        this.chart = new Highcharts.Chart(this.parseOption(data.stores || []));
      }
    }
  });
});