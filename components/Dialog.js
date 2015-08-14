define([
  'jquery',
  'Trunk'
], function($, Trunk) {

  var View = Trunk.extend({

    stat: {
      // Save the number of open
      opens: 0
    },

    tag: 'div',

    className: 'dialog',

    template: '#template-dialog',

    events: {
      'click': 'onClick',
      'click .dialog-close': 'close'
    },

    onClick: function(e) {
      if ($(e.target).hasClass('dialog-container')) {
        this.close()
      }
    },

    close: function() {
      --this.stat.opens || this.el.one('transitionend', function() {
        $('html').removeClass('dialog-open')
      })
      this.el.removeClass('open')
      this.trigger('close')
    },

    open: function() {
      this.el.off('transitionend')
      this.stat.opens++
      $('html').addClass('dialog-open')
      this.el.css('z-index', this.stat.opens).addClass('open')
    },

    init: function() {

      this.render()
      ;(this.wapper || $('body')).append(this.el)

      this.listen(this.model, 'change:title', function(title) {
        this.$('.dialog-title').text(title)
      })

      if (this.child) {
        this.$('.dialog-body').append(this.child.el)
        this.child.dialog = this
        this.listen(this.child, 'render:after', this.open)
      }
    }
  })

  return View
})