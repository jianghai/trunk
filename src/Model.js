var $ = require('jquery')
var events = require('./events')
var ajax = require('./ajax')

function Model(prop) {

  if (prop) {
    for (var k in prop) {
      if (k === 'param') {
        this[k] = $.extend(true, {}, this[k], prop[k]);
      } else {
        this[k] = prop[k];
      }
    }
  }

  this.data = $.extend(true, {}, this.defaults, this.data);

  this.trigger('create');

  this.init && this.init();
}

$.extend(Model.prototype, events, ajax, {

  onFetch: function(res) {
    this.reset(typeof this.parse === 'function' && this.parse(res) || res);
  },

  isEqual: function(a, b) {
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      if (a !== b) return false;
    } else {
      if (Object.keys(a).length != Object.keys(b).length) return false;
      if (Array.isArray(a)) {
        for (var i = 0; i < a.length; i++) {
          if (!this.isEqual(a[i], b[i])) return false;
        }
      } else {
        for (var k in a) {
          if (!this.isEqual(a[k], b[k])) return false;
        }
      }
    }
    return true;
  },

  set: function(data, options) {

    if (typeof data === 'string') {
      var _data = data;
      data = {};
      data[_data] = options;
      options = arguments[2]
    }

    options || (options = {});

    // Validate if set
    if (this.validate && options.validate !== false) {
      this.trigger('validate', data);
      if (!this.validate(data)) {
        this.trigger('invalid');
        return false;
      }
    }

    if (!options.silent) {
      for (var k in data) {
        if (!this.isEqual(data[k], this.data[k])) {
          this.data[k] = data[k];
          this.trigger('change:' + k, data[k]);
        }
      }
      this.trigger('change', data);
      this.collection && this.collection.trigger('change');
    }
    return true;
  },

  reset: function(data) {
    this.data = $.extend({}, this.defaults, data);
    // this.trigger('change', data);
    this.trigger('reset', data)
    this.collection && this.collection.trigger('change')
    this.view.render()
  },

  remove: function() {
    this.collection && this.collection.reduce(this);
    this.data = this.defaults || {};
    this.view.el.remove();
  },

  // Insert a model after this to this.collection
  after: function(data) {
    var model = new this.constructor({
      data: data
    });
    model.collection = this.collection;
    this.collection.list.splice(this.index() + 1, 0, model);
    this.collection.trigger('add', model);
    this.collection.trigger('change');
  },

  // Get index of this.collection
  index: function() {
    return this.collection.list.indexOf(this);
  },

  // Get the model before this
  prev: function() {
    return this.collection.list[this.index() - 1];
  },

  // Get the model after this
  next: function() {
    return this.collection.list[this.index() + 1];
  }
})

module.exports = Model