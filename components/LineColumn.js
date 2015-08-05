define([
  'jquery',
  'Trunk',
  'highcharts',
], function($, Trunk, Highcharts) {

  var View = Trunk.extend({

    el: '#lineColumn',

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
      this.trigger('render:before')
      this.chart = new Highcharts.Chart(this.parseOption(this.model.data || []))
      this.trigger('render:after')
    }
  })

  View.Model = Trunk.Model.extend({})

  return View
})