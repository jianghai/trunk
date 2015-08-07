define([
  'jquery',
  'Trunk',
  'highcharts',
], function($, Trunk, Highcharts) {

  var View = Trunk.extend({

    el: '#pie',

    defultOption: {
      chart: {
        type: 'pie'
      },
      credits: {
        enabled: false
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b> 占比{point.percentage:.1f}%'
      },
      title: {},
      series: []
    },

    parseOption: function(data) {

      var option = $.extend(true, {}, this.defultOption, this.option)

      option.chart.renderTo = this.el[0]

      option.title.text = data.title

      var _data = []
      for (var k in data.data) {
        _data.push({
          name: k,
          y: data.data[k]
        })
      }
      option.series[0] = {
        data: _data
      }

      return option
    },

    renderer: function() {
      new Highcharts.Chart(this.parseOption(this.model.data || []))
    }
  })

  View.Model = Trunk.Model.extend({})

  return View
})