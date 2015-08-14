require([
  'Trunk',
  'Pagination'
], function(Trunk, Pagination) {
  
  var pagination = new Pagination({
    el: '#pagination'
  })
  
  pagination.model.reset({
    current: 1, // 当前页
    counts: 20 // 总页数
  })

  // 跟其他组件关联
  var list = new Trunk()
  list.listen(pagination.model, 'change:current', function(current) {
    // 列表重新查询
    // list.model.setParam('current', current) 
    
    // 列表数据可能变化，重新渲染分页 
    pagination.model.reset({
      current: current,
      counts: 20
    })
  })
})