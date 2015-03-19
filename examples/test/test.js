$(function() {

  var Autocomplete = Trunk.View.extend({

    events: {
      'input input': 'onInput',
      'keydown input': 'onKeydown',
      'blur input': 'onBlur'
    },

    onInput: function(e) {
      this.result.search(e.target.value);
    },

    onKeydown: function(e) {
      var key = e.keyCode;
      if (key === 40 || key === 38) {
        if (!this.result.el.hasClass('open')) {
          return this.result.search(e.target.value);
        }
        key === 40 && this.result.selectIndex++;
        key === 38 && this.result.selectIndex--;
        this.result.toggle();
      }
      if (key === 13) {
        this.result.select();
      }
    },

    onBlur: function() {
      this.result.close();
    },

    onToggle: function(val) {
      this.$('input').val(val);
    },

    onSelect: function(item) {
      this.trigger('select', item);
    },

    init: function() {

      this.result = new Trunk.View($.extend(true, {

        silent: true,

        el: '.search_result',

        events: {
          'mousedown li': 'onMousedown'
        },

        search: function(keyword) {
          this.model.setParam(this.searchParam, keyword);
        },

        onMousedown: function(e) {
          this.target = $(e.currentTarget);
          this.toggleDone();
          this.select();
        },

        toggle: function() {

          var children = this.el.children();
          if (children.length < 2) return;

          if (this.selectIndex == children.length) {
            this.selectIndex = 0;
          }
          if (this.selectIndex == -1) {
            this.selectIndex = children.length - 1;
          }
          this.$('.active').removeClass('active');
          this.target = children.eq(this.selectIndex).addClass('active');
          this.toggleDone();
        },

        toggleDone: function() {
          this.trigger('toggle', this.target.attr('data-val'));
        },

        select: function() {
          this.trigger('select', this.model.data[this.target.index()]);
          this.close();
        },

        onSync: function() {
          // Reset index when data change
          this.selectIndex = -1;
          this.el.addClass('open');
        },

        close: function() {
          this.el.removeClass('open');
        },

        init: function() {
          this.listen(this.model, 'sync', this.onSync);
        }
      }, this.result));

      this.listen(this.result, 'toggle', this.onToggle);
      this.listen(this.result, 'select', this.onSelect);

      this.children = [this.result];
    }
  });

  
  // call
  var ac = new Autocomplete({
    result: {
      model: {
        url: 'data.json',
      },
      searchParam: 'search',
      template: '#template-autocomplete',
    },
    el: '#autocomplete'
  });

  ac.render();
});