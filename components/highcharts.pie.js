define([
  'jquery',
  'trunk',
  'highcharts'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    parse: function(data) {
      var self = this;
      var _data = [];
      $.each(data || [], function(k, v) {
        _data.push([self.cols[k] || k, v]);
      });
      return {
        name: this.name,
        data: _data
      };
    }
  });

  return Trunk.View.extend({

    Model: Model,

    defultOption: {
      chart: {
        style: {
          fontFamily: 'Arial "Microsoft Yahei"'
        }
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
      colors: ['#69b4ee', '#9574d9', '#86b320', '#2ec7c9'],
      series: [{
        type: 'pie'
      }]
    },

    parseOption: function(data) {
      var option = $.extend(true, {}, this.defultOption);
      $.extend(true, option, this.option);

      option.series[0].name = data.name;
      option.series[0].data = data.data;
      return option;
    },

    render: function() {
      this.el.highcharts(this.parseOption(this.model.data));
    }
  });
});