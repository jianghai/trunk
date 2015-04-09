define([
  'jquery',
  'trunk',
  'daterange',
  'dropdown',
  'jquery.extend'
], function($, Trunk) {

  var View = Trunk.View.extend({

    model: Trunk.Model.extend(),

    events: {
      'click .date-item': 'onSelect'
    },

    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    getDate: function() {
      var now = this.now;
      var d = new Date(now);
      return {
        yesterday: function() {
          return [
            d.setDate(d.getDate() - 1) && d.setHours(0, 0, 0, 0),
            d.setHours(23, 59, 59, 0)
          ]
        },
        today: function() {
          return [
            d.setHours(0, 0, 0, 0),
            now
          ]
        },
        week: function() {
          return [
            d.setDate(d.getDate() - 6) && d.setHours(0, 0, 0, 0),
            d.setDate(d.getDate() + 6) && d.setHours(23, 59, 59, 0)
          ]
        }
      };
    },

    onSelect: function(e) {
      this.$('.active').removeClass('active');
      var target = $(e.target);
      target.addClass('active');
      var type = target.attr('data-type');

      var date = this.getDate()[type]();

      this.model.set({
        begin: date[0],
        end: date[1]
      });

      this.picker.DatePickerSetDate(date, true);
    },

    getBegin: function() {
      return this.model.data.begin;
    },

    getEnd: function() {
      return this.model.data.end;
    },

    onChange: function(data) {
      this.renderDate(data.begin, data.end);
      this.trigger('change', data);
    },

    renderDate: function(begin, end) {
      this.$('.date-begin').text($.format.date(begin, 'yyyy-mm-dd'));
      this.$('.date-end').text($.format.date(end, 'yyyy-mm-dd'));
    },

    disabled: function(date) {
      var d = new Date(this.now);
      return date.valueOf() > this.now || date.valueOf() < d.setDate(d.getDate() - 90)
    },

    init: function() {
      this.listen(this.model, 'change', this.onChange);

      this.now = +new Date(+this.el.attr('data-now'));
      var begin = new Date(this.$('.date-begin').text());
      var end = new Date(this.$('.date-end').text());
      var notSameDay = begin.getDay() !== end.getDay() || begin < end - 24 * 60 * 60 * 1000;
      this.model.set({
        begin: begin.setHours(0, 0, 0, 0),
        end: notSameDay ? end.setHours(23, 59, 59, 0) : this.now,
      }, {
        change: false
      });
      var _this = this;
      this.picker = this.$('.drop-layer').DatePicker({
        flat: true,
        date: [this.getBegin(), this.getEnd()],
        calendars: 3,
        mode: 'range',
        starts: 1,
        onRender: function(date) {
          return {
            disabled: _this.disabled.call(_this, date)
          };
        },
        onSure: function() {
          _this.$('.active').removeClass('active');
          _this.$('.selected-item').addClass('active');
          _this.model.set({
            begin: +arguments[1][0],
            end: +arguments[1][1]
          })
          _this.close();
        },
        onCancel: function() {
          _this.close();
        }
      });
    }
  });

  return View;
});