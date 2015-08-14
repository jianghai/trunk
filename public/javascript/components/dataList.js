require([
  'DataList'
], function(DataList) {
  
  var list = new DataList({
    model: {
      url: '/json/components/dataList.json'
    }
  })
  list.model.fetch()
})