require([
  'DataTable'
], function(DataTable) {
  
  var table = new DataTable({
    model: {
      url: window.public + 'json/components/dataTable.json'
    }
  })
  table.model.fetch()
})