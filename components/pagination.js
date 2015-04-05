define([
  'jquery',
  'trunk'
], function($, Trunk) {

  var Model = Trunk.Model.extend({

    shows: 5,

    parse: function(data) {
      var current = +data.current;
      var counts = +data.counts;
      var start = Math.max(Math.min(current - Math.floor(this.shows / 2), counts - this.shows + 1), 1);
      var end = Math.min(Math.max(current + Math.floor(this.shows / 2), this.shows), counts);
      if (start <= 3) {
        start = 1;
      }
      if (end > counts - 3) {
        end = counts;
      }
      this.reset({
        current: current,
        counts: counts,
        start: start,
        end: end
      });
    }
  });

  var View = Trunk.View.extend({

    model: Model,

    tag: 'div',

    className: 'pagination-container clearfix',

    template: '#template-pagination',

    events: {
      'click .page': 'onPageChange',
      'submit .form-paging': 'onSubmit'
    },

    onSubmit: function(e) {
      e.preventDefault();
      var form = $(e.target);
      var input = $(form[0].page);
      var page = input.val();
      if (isNaN(page) || parseInt(page) !== +page) {
        page = 1;
      } else if (page > this.model.data.counts) {
        page = this.model.data.counts;
      }
      this.pageTo(page);
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
      this.pageTo(page);
    },

    pageTo: function(page) {
      this.trigger('change', page);
    }
  });

  return View;
});