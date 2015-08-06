require([
  'Pie'
], function(Pie) {

  var pie = new Pie({
    model: {
      url: 'pie/json.json'
    }
  })
  pie.model.fetch()
})