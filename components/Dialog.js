define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend()

  return Trunk.View.extend({

    Model: Model,

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
      this.stat.opens++
      $('html').addClass('dialog-open')
      this.el.css('z-index', this.stat.opens).addClass('open')
    },

    init: function() {

      this.render()

      (this.wapper || $('body')).append(this.el)

      this.listen(this.model, 'change:title', function(title) {
        this.$('.dialog-title').text(title)
      })

      this.$('.dialog-body').append(this.child.el)

      // this.child.delegateEvents()

      this.child.dialog = this

      this.listen(this.child, 'render:after', this.open)
    }
  })
});