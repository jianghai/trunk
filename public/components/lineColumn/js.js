require([
  'LineColumn'
], function(LineColumn) {

  var line = new LineColumn({
    model: {
      url: 'lineColumn/json.json'
    }
  })
  line.model.fetch()
})