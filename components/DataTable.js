define([
  'DataList'
], function(DataList) {

  var View = DataList.extend({

    el: '#dataTable',

    template: '.template-dataTable',
    
    renderer: function() {
      this.template && this.$('tbody').eq(0).html(this.template(this.model.data))
    }
  })

  return View
})