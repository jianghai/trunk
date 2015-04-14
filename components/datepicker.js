define([
  'jquery',
  'trunk',
  'daterange',
  'dropdown',
  'jquery.extend'
], function($, Trunk) {

  return Trunk.View.extend({

    modelProperty: {
      defaults: {
        type: 'week',
      },
      getDate: {
        yesterday: function() {
          var d = new Date(this.now);
          return [
            d.setDate(d.getDate() - 1) && d.setHours(0, 0, 0, 0),
            d.setHours(23, 59, 59, 0)
          ]
        },
        today: function() {
          var d = new Date(this.now);
          return [
            d.setHours(0, 0, 0, 0),
            this.now
          ]
        },
        week: function() {
          var d = new Date(this.now);
          return [
            d.setDate(d.getDate() - 6) && d.setHours(0, 0, 0, 0),
            d.setDate(d.getDate() + 6) && d.setHours(23, 59, 59, 0)
          ]
        },
        month: function() {
          var d = new Date(this.now);
          return [
            d.setDate(d.getDate() - 29) && d.setHours(0, 0, 0, 0),
            d.setDate(d.getDate() + 29) && d.setHours(23, 59, 59, 0)
          ]
        }
      }
    },

    events: {
      'click .date-item': 'onSelect'
    },

    el: '#datepicker',

    template: '#template-datepicker',

    afterRender: function() {
      var self = this;
      var _picker = this.picker = this.$('.drop-layer');
      _picker.DatePicker({
        flat: true,
        date: [this.getBegin(), this.getEnd()],
        calendars: 3,
        mode: 'range',
        starts: 1,
        onRender: function(date) {
          var d = new Date();
          var selected;
          try {
            selected = _picker.DatePickerGetDate();
          } catch (e) {
            selected = [self.getBegin(), self.getEnd()];
          }
          selected = [new Date(selected[0]), new Date(selected[1])];
          return {
            disabled: self.disabled(date, self.model.now, selected)
          }
        },
        onSure: function() {
          self.$('.active').removeClass('active');
          self.$('.selected-item').addClass('active');
          self.model.set({
            type: null,
            begin: +arguments[1][0],
            end: +arguments[1][1]
          });
          localStorage.removeItem('dateType');
          localStorage.setItem('dateRange', self.model.data.begin + '-' + self.model.data.end);
          self.close();
        },
        onCancel: function() {
          self.close();
        }
      });
      this.date = this.$('.selected-date');
    },

    disabled: function(date, now) {
      return date.valueOf() > now;
    },

    close: function() {
      this.$('.dropdown').removeClass('open');
    },

    onSelect: function(e) {
      this.$('.active').removeClass('active');
      var target = $(e.target);
      target.addClass('active');
      var type = target.attr('data-type');

      var date = this.model.getDate[type].call(this.model);

      localStorage.setItem('dateType', type);
      localStorage.removeItem('dateRange');

      this.picker.DatePickerSetDate([date[0], date[1]], true);

      this.model.set({
        begin: date[0],
        end: date[1]
      });
    },

    getBegin: function() {
      return this.model.data.begin;
    },

    getEnd: function() {
      return this.model.data.end;
    },

    init: function() {

      this.listen(this.model, 'change', function(data) {
        this.date.html($.format.date(data.begin, 'yyyy-mm-dd') + ' -- ' + $.format.date(data.end, 'yyyy-mm-dd'));
      });

      this.model.now = +this.el.attr('data-now') || +new Date();

      var data = {
        type: this.model.data.type
      };

      var dateType = localStorage.getItem('dateType');
      dateType && (data.type = dateType);

      var dateRange = localStorage.getItem('dateRange');
      if (dateRange) {
        dateRange = dateRange.split('-');
        data.type = null;
        data.begin = +dateRange[0];
        data.end = +dateRange[1];
      }
      
      if (data.type) {
        var date = this.model.getDate[data.type].call(this.model);
        data.begin = date[0];
        data.end = date[1];
      }

      this.model.set(data, {
        change: false
      });
    }
  });
});