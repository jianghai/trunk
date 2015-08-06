require([
  'DataList'
], function(DataList) {
  
  var list = new DataList({
    model: {
      url: 'dataList/json.json'
    }
  })
  list.model.fetch()
})