require([
  'jquery',
  'Trunk',
  'Dialog'
], function($, Trunk, Dialog) {

  var loading = $('#template-loading').html()
  // Trunk.prototype.init = function() {
  //   this.listen(this.model, 'request', function() {
  //     this.el
  //   })
  // }
  
  $.ajaxSetup({
    cache: true
  })

  var app = new Trunk({
    el: 'table',
    events: {
      'click .demo': 'onDemo'
    },
    onDemo: function(e) {
      var target = $(e.target)
      if (target[0].loading) return

      var self = this
      var component = target.attr('data-component')
      var _loading = $(loading)
      target.before(_loading)
      target[0].loading = true

      $.ajax({
        url: window.baseDir + 'components/' + component + '.html'
      }).done(function(res) {
        self.stage.$('.dialog-content').html(res)
        $.getScript(window.public + 'javascript/components/' + component + '.js', function() {
          target[0].loading = false
          _loading.remove()
          self.stage.open()
        })
      })
    },
    init: function() {
      this.stage = new Dialog({
        className: 'stage',
        template: '#template-stage'
      })
    }
  })


  $('body').on('click', '.tab-nav', function(e) {
    var target = $(e.currentTarget)
    var index = target.index()
    target.addClass('active').siblings().removeClass('active')
    target.parent().next().children().removeClass('active').eq(index).addClass('active')
    return false
  })
})