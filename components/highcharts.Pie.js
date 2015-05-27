define([
  'jquery',
  'trunk',
  'highcharts',
  'highcharts.config',
], function($, Trunk) {

  var Model = Trunk.Model.extend({
  });

  return Trunk.View.extend({

    Model: Model,

    defultOption: {
      chart: {

      },
      title: {
        text: null
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            style: {
              color: '#747d94',
              textShadow: 'none',
              fontWeight: 'normal'
            }
          }
        }
      },
      series: [{
        type: 'pie'
      }]
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option);

      option.series[0].data.forEach(function(item) {
        item.y = +data[item.key] || 0;
      });
      
      return option;
    },

    render: function() {
      this.defultOption.chart.renderTo = this.el[0];

      if (!this.chart) {
        this.chart = new Highcharts.Chart(this.defultOption);
      }

      var data = this.model.data;

      // if (!Object.keys(data).length) {
      //   this.chart.showLoading('暂无数据');
      // } else {
        this.chart = new Highcharts.Chart(this.parseOption(data));
      // }
    }
  });
});