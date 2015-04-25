define([
  'jquery',
  'trunk',
  'Pagination'
], function($, Trunk, Pagination) {

  return Trunk.View.extend({

    noPaging: function() {
      this.pagination.el.remove();
      this.pagination = null;
    },

    init: function() {

      this.tbody = new Trunk.View({

        Model: Trunk.Model.extend({

          param: {
            start: 0,
            limit: 10
          },

          restart: function() {
            this.param.start = 0;
            return this;
          }
        }),

        el: 'tbody'

      }, this.tbody);

      this.listen(this.tbody.model, 'sync', function(res) {

        var start = this.tbody.model.param.start;
        var limit = this.tbody.model.param.limit;

        if (res.total > limit) {

          if (!this.pagination) {
          
            this.pagination = new Pagination();

            this.el.append(this.pagination.el);

            this.tbody.listen(this.pagination, 'change', function(current) {
              this.model.setParam('start', (current - 1) * limit);
            });
            
            this.listen(this.tbody.model, 'empty', this.noPaging);
            this.listen(this.tbody.model, 'error', this.noPaging);
          }

          this.pagination.model.set({
            current: start / limit + 1,
            counts: Math.ceil(res.total / limit)
          });
        }

        if (!res.total || res.total <= limit) {
          this.pagination && this.noPaging();
        }
      });

      this.children = [this.tbody];
    }
  });
});