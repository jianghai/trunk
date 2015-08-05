define([
  'DataList'
], function(DataList) {

  var View = DataList.extend({

    el: '#dataTable',

    template: '.template-dataTable',
    
    render: function() {
      this.trigger('render:before')
      this.template && this.$('tbody').eq(0).html(this.template(this.model.data))
      this.trigger('render:after')
      return this.el
    }
  })

  return View
})