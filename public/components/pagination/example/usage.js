require([
  'Trunk',
  'Pagination'
], function(Trunk, Pagination) {
  
  var pagination = new Pagination({
    el: '#pagination'
  })
  pagination.model.reset({
    current: 10, // 当前页
    counts: 50 // 总页数
  })

  /**
   * 切换分页，列表重新渲染，此时当前页和总页数可能会变化（数据源变化），
   * 所以重置分页的参数
   */
  var list = new Trunk()
  
  list.listen(pagination.model, 'change:current', function(current) {
    // Do ...
    pagination.model.reset({
      current: 40,
      counts: 100
    })
  })
})