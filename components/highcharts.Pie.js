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
        item.y = data[item.key];
      });
      
      return option;
    },

    render: function() {
      this.el.highcharts(this.parseOption(this.model.data));
    }
  });
});