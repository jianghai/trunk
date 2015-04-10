define([
  'jquery',
  'trunk',
  'pagination'
], function($, Trunk, Pagination) {

  return Trunk.View.extend({

    init: function() {

      var pagination = new Pagination({
        silent: true
      });

      this.tbody = new Trunk.View({
        Model: Trunk.Model.extend({
          param: {
            start: 0,
            limit: 10
          }
        }),
        el: 'tbody',
        init: function() {

          this.children = [pagination];

          this.on('render:after', function() {
            pagination.model.parse({
              total: this.model.data.total,
              start: this.model.param.start,
              limit: this.model.param.limit
            });
          });

          this.listen(pagination, 'change', function(page) {
            this.model.setParam({
              start: (page - 1) * this.model.param.limit
            });
          });
        }
      }, this.tbody);

      this.listen(pagination, 'render:after', function() {
        this.el.after(pagination.el);
      });

      this.children = [this.tbody];
    }
  });
});