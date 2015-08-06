require([
  'DataTable'
], function(DataTable) {

  var table = new DataTable({
    model: {
      url: 'dataTable/json.json'
    }
  })
  table.model.fetch()
})