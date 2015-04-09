define([
  'jquery',
  'trunk',
  'pagination'
], function($, Trunk, Pagination) {

  return Trunk.View.extend({

    Model: Trunk.Model.extend({
      param: {
        start: 0,
        limit: 10
      }
    }),

    init: function() {

      // this.tbody = new Trunk.View()

      this.pagination = new Pagination();

      this.on('render:after', function() {
        this.pagination.model.parse({
          totals: this.model.data.totals,
          start: this.model.param.start,
          limit: this.model.param.limit
        });
      });

      this.listen(this.pagination, 'change', function(page) {
        this.model.setParam({
          start: (page - 1) * this.model.param.limit
        });
      });

      this.listen(this.pagination, 'render:after', function() {
        this.el.append(this.pagination.el);
      });
    }
  });

  return View;
});