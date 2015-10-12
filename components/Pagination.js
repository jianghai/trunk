define([
  'jquery',
  'trunk'
], function($, Trunk) {

  return Trunk.View.extend({

    Model: Trunk.Model.extend({

      shows: 5,

      onChange: function() {
        var current = this.data.current;
        var counts = this.data.counts;
        var start = Math.max(Math.min(current - Math.floor(this.shows / 2), counts - this.shows + 1), 1);
        var end = Math.min(Math.max(current + Math.floor(this.shows / 2), this.shows), counts);
        if (start <= 3) {
          start = 1;
        }
        if (end > counts - 3) {
          end = counts;
        }
        this.reset({
          counts: counts,
          current: current,
          start: start,
          end: end
        });
      }
    }),

    tag: 'div',

    className: 'pagination-container',

    template: '#template-pagination',

    events: {
      'click .page': 'onPageChange',
      'submit form': 'onSubmit'
    },

    onSubmit: function(e) {
      e.preventDefault();
      var form = $(e.target);
      var input = $(form[0].page);
      var page = input.val();
      if (isNaN(page) || page > this.model.data.counts || page < 1) {
        return input.focus()
      }
      this.trigger('change', +page);
    },

    onPageChange: function(e) {
      e.preventDefault();
      var target = $(e.target);
      var page = target.attr('data');
      if (!page) return;
      if (page === 'prev') {
        page = this.model.data.current - 1;
      } else if (page === 'next') {
        page = this.model.data.current + 1;
      }
      this.trigger('change', +page);
    },

    init: function() {
      this.model.on('change', this.model.onChange);
    }
  });
});