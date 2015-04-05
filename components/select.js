define(['base'], function(base) {

  var Model = base.Model.extend({
    parse: function(res) {
      return {
        items: res
      }
    }
  });

  var View = base.View.extend({

    model: Model,

    template: '#template-select',

    loading: function() {
      this.el.html('<option value="">加载中</option>');
    },

    error: function() {
      this.el.html('<option value="">加载错误</option>');
    }
  });

  return View;
});