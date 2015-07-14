define([
  'jquery',
  'trunk',
  'base',
  'pagination'
], function($, Trunk, base, Pagination) {

  var Model = base.Model.extend({

    setParam: function() {
      this.param.start = 0;
      base.Model.prototype.setParam.apply(this, arguments);
    },

    init: function() {

      var self = this;

      if (!this.param) {
        this.param = {};
      }
      this.param.start = 0;
      this.param.limit = this.param.limit || 10;

      if (this.param.sort) {
        this.param.sortType = this.param.sortType || 'desc';
      }

      this.on('sync', function(res) {
        self.cols && (res.cols = self.cols);
        res.param = self.param;
      });
    }
  });

  var View = base.View.extend({

    model: Model,

    events: {
      'click .sort': 'onSort'
    },

    onSort: function(e) {
      var target = $(e.currentTarget);
      var col = target.attr('data-col');
      var type = target.hasClass('desc') ? 'asc' : 'desc';
      this.model.setParam({
        start: 0,
        sort: col,
        sortType: type
      });
    },

    pageTo: function(page) {
      this.model.setParam({
        start: (page - 1) * this.model.param.limit
      });
    },

    afterRender: function() {
      var _counts = Math.ceil(this.model.data.totals / this.model.param.limit);
      if (!_counts) return;
      this.pagination.model.parse({
        current: this.model.param.start / this.model.param.limit + 1,
        counts: _counts
      });
      this.el.append(this.pagination.el);
    },

    init: function() {

      this.pagination = new Pagination();

      this.listen(this.pagination, 'change', this.pageTo);
    }
  });

  return View;
});