define([
  'Trunk',
  'Pagination'
], function(Trunk, Pagination) {

  /**
   * 数据列表，支持分页
   */
  var View = Trunk.extend({

    el: '#dataList',

    template: '.template-dataList',

    init: function() {

      this.listen(this.model, 'reset', function(res) {

        var start = this.model.param.start
        var limit = this.model.param.limit
        var count = res.count

        if (!count || count <= limit) {

          this.pagination && this.pagination.remove()

        } else if (count > limit) {

          if (!this.pagination) {

            this.pagination = new Pagination()

            this.el.after(this.pagination.el)

            this.listen(this.pagination.model, 'change:current', function(current) {
              this.model.setParam('start', (current - 1) * limit)
            })
          }

          this.pagination.model.reset({
            current: start / limit + 1,
            counts: Math.ceil(count / limit)
          })
        }
      })
    }
  })

  View.Model = Trunk.Model.extend({

    param: {
      start: 0,
      limit: 10
    },

    /**
     * 条件改变后分页重置
     */
    setParam: function() {
      this.param.start = 0
      Trunk.Model.prototype.setParam.apply(this, arguments)
    }
  })

  return View
})