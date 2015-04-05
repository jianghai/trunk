define([
  'jquery',
  'base',
  'trunk'
], function($, base, Trunk) {

  var Autocomplete = Trunk.View.extend({

    events: {
      'input input': 'onInput',
      'keydown input': 'onKeydown',
      'blur input': 'onBlur'
    },

    onInput: function(e) {
      this.oldVlaue = e.target.value;
      this.result.search(this.oldVlaue);
    },

    onKeydown: function(e) {
      
      var key = e.keyCode;
      if (key === 40 || key === 38) {
        if (!this.result.el.hasClass('open')) {
          return this.result.search(e.target.value);
        }
        if (this.result.isEmpty) return;
        key === 40 && this.result.selectIndex++;
        key === 38 && this.result.selectIndex--;
        this.result.toggle();
      }
      if (key === 13) {
        e.preventDefault();
        this.result.target && this.result.select();
        this.$('input').focusout();
      }
    },

    onBlur: function() {
      this.result.close();
    },

    onToggle: function(val) {
      this.$('input').val(val || this.oldVlaue);
    },

    onSelect: function(item) {
      this.trigger('select', item);
    },

    afterRender: function() {
      this.result.el = this.$('.search-result');
      this.result.getTemplate();
      this.result.delegateEvents();
    },

    init: function() {

      this.result = new base.View($.extend(true, {

        events: {
          'mousedown li': 'onMousedown',
          'mouseover li': 'onMouseover'
        },

        afterRender: function() {
          this.target = this.el.children().eq(0);
        },

        search: function(keyword) {
          this.model.setParam(this.searchParam, keyword);
        },

        onMousedown: function(e) {
          this.target = $(e.currentTarget);
          this.toggleDone();
          this.select();
        },

        onMouseover: function(e) {
          this.$('.active').removeClass('active');
          this.selectIndex = $(e.currentTarget).addClass('active').index();   
        },

        toggle: function() {

          var children = this.el.children();
          // if (children.length < 2) return;

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
          this.trigger('toggle', this.target && this.target.attr('data-val') || null);
        },

        select: function() {
          this.toggleDone();
          this.trigger('select', this.target && this.model.data[this.target.index()]);
          this.close();
        },

        loading: function() {},

        empty: function() {
          this.target = null;
          this.open();
          this.isEmpty = true;
          this.el.html('<p class="empty">无结果</p>');
        },

        onSync: function() {
          this.isEmpty = false;
          this.selectIndex = 0;
          this.open();
        },

        open: function() {
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

  return Autocomplete;
});