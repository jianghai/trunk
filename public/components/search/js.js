require([
  'Search'
], function(Search) {
  
  var search = new Search()
  
  /**
   * 一般由其他组件监听search行为
   * dataTable.listen(search, 'search', function(kw) {
   *   this.model.setParam('keyword', kw)
   * })
   */
  search.on('search', function(kw) {
    alert(kw || '重置')
  })
})