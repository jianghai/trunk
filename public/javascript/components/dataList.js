require([
  'DataList'
], function(DataList) {
  
  var list = new DataList({
    model: {
      url: window.public + 'json/components/dataList.json'
    }
  })
  list.model.fetch()
})