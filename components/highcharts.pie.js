define([
  'jquery',
  'base',
  'app',
  'highcharts'
], function($, base, app) {

  var Model = base.Model.extend({

    parse: function(data) {
      var _this = this;
      var _data = [];
      var _key = this.cols[0].col;
      $.each(data.stores || [], function() {
        _data.push([this[_this.group], this[_key]]);
      });
      return {
        name: this.cols[0].name,
        data: _data
      };
    }
  });

  var View = base.View.extend({

    model: Model,

    defultOption: {
      chart: {
        
      },
      title: {
        text: null
      },
      tooltip: {
        pointFormat: '<b>{point.name}</b>: {point.percentage:.1f} %'
      },
      credits: {
        enabled: false
      },
      colors: app.color,
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