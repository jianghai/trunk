$(function() {

  var Autocomplete = Trunk.View.extend({

    events: {
      'input input': 'onInput',
      'keydown input': 'onKeydown',
      'blur input': 'onBlur'
    },

    onInput: function() {
      this.result.show();
    },

    onKeydown: function(e) {
      var key = e.keyCode;
      if (key === 40 || key === 38) {
        if (!this.result.el.hasClass('open')) {
          return this.result.el.addClass('open');
        }
        key === 40 && this.result.selectIndex++;
        key === 38 && this.result.selectIndex--;
        this.result.changeSelect();
      }
      if (key === 13) {
        this.result.close();
      }
    },

    onBlur: function() {
      this.result.close();
    },

    onSelect: function(val) {
      this.$('input').val(val);
    },

    init: function() {

      this.result = new Trunk.View({

        modelProperty: {
          url: this.url
        },

        el: this.$('.search_result'),

        template: this.template,

        events: {
          'mousedown li': 'onSelect'
        },

        onSelect: function(e) {
          this.selectIndex = $(e.currentTarget).index();
          this.changeSelect();
          this.close();
        },

        changeSelect: function() {

          var children = this.el.children();
          if (children.length < 2) return;

          if (this.selectIndex == children.length) {
            this.selectIndex = 0;
          }
          if (this.selectIndex == -1) {
            this.selectIndex = children.length - 1;
          }
          this.$('.active').removeClass('active');
          var target = children.eq(this.selectIndex).addClass('active');
          this.trigger('select', target.attr('data-val'));
        },

        onSync: function() {
          this.el.addClass('open');
        },

        close: function() {
          this.el.removeClass('open');
        },

        init: function() {
          this.selectIndex = 0;
          this.listen(this.model, 'sync', this.onSync);
        }
      });

      this.listen(this.result, 'select', this.onSelect);
    }
  });


  
  // call
  var ac = new Autocomplete({
    url: 'data.json',
    template: '#template-autocomplete',
    el: '#autocomplete'
  });
});