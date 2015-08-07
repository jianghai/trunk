define([
  'jquery',
  'Trunk'
], function($, Trunk) {

  var View = Trunk.extend({

    el: '#search',

    events: {
      'input input': 'onInput',
      'submit': 'onSubmit',
      'click .tk-clear': 'onClear',
    },

    onInput: function(e) {
      var value = e.target.value
      this.trigger('input', value)
      if (value) {
        this.el.addClass('tk-weighty')
      } else {
        this.clear()
      }
    },

    onClear: function() {
      this.clear()
    },

    clear: function() {
      this.el.removeClass('tk-weighty')
      this.$('input').val('')
      if (this.searched) {
        this.trigger('search', '')
        this.searched = false
      }
    },

    onSubmit: function(e) {
      e.preventDefault()
      var form = $(e.target)
      var input = form.find('input')
      var kw = input.val()
      if (!kw) return input.focus()
      this.searched = true
      this.trigger('search', $.trim(kw))
    }
  })

  return View
})