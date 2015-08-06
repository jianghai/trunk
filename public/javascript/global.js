require([
  'jquery',
  'Trunk'
], function($, Trunk) {

  Trunk.prototype.init = function() {
    this.on('render:after', function() {
      this.el.parent().addClass('in')
    })
  }


  $('body').on('click', '.tab-nav button', function(e) {
    var target = $(e.currentTarget)
    var index = target.index()
    target.addClass('active').siblings().removeClass('active')
    target.closest('.tab').find('.tab-content').children().removeClass('active').eq(index).addClass('active')
    return false
  })
})