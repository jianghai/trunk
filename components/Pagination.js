define([
  'jquery',
  'Trunk'
], function($, Trunk) {

  var View = Trunk.extend({

    tag: 'div',

    className: 'pagination-container',

    template: '#template-pagination',

    events: {
      'click .page': 'onPageChange',
      'keydown .custom-page': 'onCustomPageKeypress',
      'paste .custom-page': 'onCustomPagePaste',
      'submit form': 'onSubmit'
    },

    onCustomPageKeypress: function(e) {
      var charCode = (e.which) ? e.which : event.keyCode;
      if (charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
    },

    onCustomPagePaste: function(e) {
      var data = e.originalEvent.clipboardData.getData('text/plain');
      if (isNaN(data)) {
        return false;
      }
    },

    onSubmit: function(e) {
      e.preventDefault()
      var form = $(e.target)
      var input = $(form[0].page)
      var page = input.val()
      if (isNaN(page) || parseInt(page) !== +page) {
        page = 1
      } else if (page > this.model.data.counts) {
        page = this.model.data.counts
      }
      this.model.set('current', +page)
    },

    onPageChange: function(e) {
      e.preventDefault()
      var target = $(e.target)
      var page = target.attr('data-page')
      if (!page) return
      if (page === 'prev') {
        page = this.model.data.current - 1
      } else if (page === 'next') {
        page = this.model.data.current + 1
      }
      this.model.set('current', +page)
    }
  })

  View.Model = Trunk.Model.extend({

    shows: 5,

    init: function() {
      this.on('reset', function(data) {
        var current = data.current
        var counts = data.counts
        var start = Math.max(Math.min(current - Math.floor(this.shows / 2), counts - this.shows + 1), 1)
        var end = Math.min(Math.max(current + Math.floor(this.shows / 2), this.shows), counts)
        if (start <= 3) {
          start = 1
        }
        if (end > counts - 3) {
          end = counts
        }
        this.data.start = start
        this.data.end = end
      })
    }
  })

  return View
})  