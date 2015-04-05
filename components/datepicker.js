define([
  'jquery',
  'trunk',
  'daterange',
  'dropdown'
], function($, Trunk) {

  var d = new Date();

  return new Trunk.View({

    modelProperty: {
      defaults: {
        type: 'week',
        end: d.setDate(d.getDate() - 1),
        begin: d.setDate(d.getDate() - 6)
      }
    },

    events: {
      'click .date-item': 'onSelect'
    },

    el: '.datepicker',

    template: '#template-datepicker',

    afterRender: function() {
      var _this = this;
      var _picker = this.picker = this.$('.drop-layer');
      _picker.DatePicker({
        flat: true,
        date: [this.getBegin(), this.getEnd()],
        calendars: 3,
        mode: 'range',
        starts: 1,
        onRender: function(date) {
          // if (!_this.picker) return {};
          var d = new Date();
          var selected;
          try {
            selected = _picker.DatePickerGetDate();
          } catch (e) {
            selected = [_this.getBegin(), _this.getEnd()];
          }

          selected = [new Date(selected[0]), new Date(selected[1])];

          return {
            disabled: _this.disabled(date, d, selected)
            // disabled: date.valueOf() > d.valueOf()
            //   || date.valueOf() < selected[0].setDate(selected[0].getDate() - 90) 
            //   || date.valueOf() > selected[1].setDate(selected[1].getDate() + 90)
            // disabled: (date.valueOf() > d.valueOf() || date.valueOf() < d.setDate(d.getDate() - 90))
          }
        },
        onSure: function() {
          _this.$('.active').removeClass('active');
          _this.$('.selected-item').addClass('active');
          _this.model.set({
            type: null,
            begin: +arguments[1][0],
            end: +arguments[1][1]
          })
          _this.close();
        },
        onCancel: function() {
          _this.close();
        }
      });
      this.date = this.$('.selected-date');
    },

    disabled: function(date, d, selected) {
      return date.valueOf() > d.valueOf();
    },

    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    onSelect: function(e) {
      this.$('.active').removeClass('active');
      var target = $(e.target);
      target.addClass('active');
      var type = target.attr('data-type');
      var d = new Date();
      var res = {
        type: type,
        end: d.setDate(d.getDate() - 1)
      };
      if (type === 'yesterday') {
        res.begin = +d;
      } else if (type ==='week') {
        res.begin = d.setDate(d.getDate() - 6);
      } else {
        res.begin = d.setDate(d.getDate() - 29);
      }

      this.picker.DatePickerSetDate([res.begin, res.end], true);

      this.model.set(res);
    },

    getBegin: function() {
      return this.model.data.begin;
    },

    getEnd: function() {
      return this.model.data.end;
    },

    onDataChange: function(data) {
      this.renderDate(data.begin, data.end);
      this.onChange && this.onChange(data);
    },

    renderDate: function(begin, end) {
      this.date.html($.format.date(begin, 'yyyy-mm-dd') + ' -- ' + $.format.date(end, 'yyyy-mm-dd'));
    },

    init: function() {
      this.listen(this.model, 'change', this.onDataChange);
    }
  });
});