require([
  'Pie'
], function(Pie) {

  var pie = new Pie({
    model: {
      url: window.public + 'json/components/pie.json'
    }
  })
  pie.model.fetch()
})