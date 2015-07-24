define([
  'jquery',
  'trunk',
  'Pagination'
], function($, Trunk, Pagination) {

  var List = Trunk.View.extend({

    Model: Trunk.Model.extend({

      param: {
        start: 0,
        limit: 10
      },

      setParam: function() {
        this.param.start = 0;
        Trunk.Model.prototype.setParam.apply(this, arguments)
      }
    }),

    el: 'tbody'
  });

  return Trunk.View.extend({

    noPaging: function() {
      this.pagination.el.remove();
      this.pagination = null;
    },

    init: function() {

      this.list = new List(this.list);

      this.listen(this.list.model, 'sync', function(res) {

        var start = this.list.model.param.start;
        var limit = this.list.model.param.limit;

        if (res.total > limit) {

          if (!this.pagination) {
          
            this.pagination = new Pagination();

            this.el.append(this.pagination.el);

            this.list.listen(this.pagination, 'change', function(current) {
              this.model.setParam('start', (current - 1) * limit);
            });
            
            this.listen(this.list.model, 'empty', this.noPaging);
            this.listen(this.list.model, 'error', this.noPaging);
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

      this.children = [this.list];
    }
  });
});