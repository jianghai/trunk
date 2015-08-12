require([
  'jquery',
  'Trunk',
  'Dialog'
], function($, Trunk, Dialog) {

  var app = new Trunk({
    el: 'table',
    events: {
      'click .demo': 'onDemo'
    },
    onDemo: function(e) {
      var self = this
      var component = $(e.target).attr('data-component')
      $.ajax({
        url: component.charAt(0).toLowerCase() + component.slice(1) + '.html'
      }).done(function(res) {
        self.stage.$('.dialog-content').html(res)
        self.stage.open()
      })
    },
    init: function() {
      this.stage = new Dialog({
        className: 'stage',
        template: '#template-stage'
      })
    }
  })

  // Trunk.prototype.init = function() {
  //   this.on('render:after', function() {
  //     this.el.parent().addClass('in')
  //   })
  // }


  $('body').on('click', '.tab-nav', function(e) {
    var target = $(e.currentTarget)
    var index = target.index()
    target.addClass('active').siblings().removeClass('active')
    target.parent().next().children().removeClass('active').eq(index).addClass('active')
    return false
  })
})