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
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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

      if (option.series[0].data) {
        // data
        // option.series[0].data.forEach(function(item) {
        //   item.y = +data[item.key] || 0;
        // });
      } else {
        option.series[0].data = [];
        data.forEach(function(store) {
          option.series[0].data.push([store[this.model.group], store[this.model.value]]);
        }, this);
      }

      return option;
    },

    render: function() {
      this.defultOption.chart.renderTo = this.el[0];

      var data = this.model.data;

      if (!data.stores || !data.stores.length) {
        this.el.html('<div class="empty">暂无数据</div>');
      } else {
        this.chart = new Highcharts.Chart(this.parseOption(data.stores || []));
      }
    }
  });
});