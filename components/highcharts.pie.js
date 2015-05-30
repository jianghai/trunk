define([
  'jquery',
  'base',
  'highcharts',
], function($, base) {

  var Model = base.Model.extend({

    parse: function(data) {
      var self = this;
      var _data = [];
      $.each(data || [], function(k, v) {
        _data.push([self.cols && self.cols[k] || k, v]);
      });
      return {
        name: this.name,
        data: _data
      };
    }
  });

  var View = base.View.extend({

    model: Model,

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
        pointFormat: '<b>{series.name}</b>: {point.percentage:.1f} %'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            style: {
              color: '#333',
              textShadow: 'none',
              fontWeight: 'normal'
            }
          }
        }
      },
      colors: ['#2ec7c9', '#5ab1ef', '#ffb980', '#eea03b', '#eee55a', '#8e9cbc', '#b0ce6b', '#48a935', '#956d95', '#dc69aa', '#E0585A', '#333'],
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

  return View;
});