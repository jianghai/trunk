define([
  'jquery',
  'trunk',
  'highcharts',
], function($, Trunk, Highcharts) {

  var Model = Trunk.Model.extend({

  });

  return Trunk.View.extend({

    Model: Model,

    defultOption: {
      chart: {},
      credits: {
        enabled: false
      },
      title: {},
      tooltip: {
        shared: true
      },
      xAxis: {},
      yAxis: {
        title: {
          text: null
        }
      }
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.chart.renderTo = this.el[0];

      option.title.text = data.title;

      option.xAxis.categories = data.xAxis.data;
      option.yAxis.title.text = data.yAxis.title;

      option.series = data.yAxis.data;

      return option;
    },

    render: function() {
      this.chart = new Highcharts.Chart(this.parseOption(this.model.data || []));
    }
  });
});