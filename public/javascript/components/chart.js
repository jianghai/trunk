require([
  'Chart'
], function(Chart) {

  var chart = new Chart({
    model: {
      url: window.public + 'json/components/chart.json'
    }
  })
  chart.model.fetch()
})