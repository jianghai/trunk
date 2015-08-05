var $ = require('jquery')
var Model = require('./Model')
var events = require('./events')
var ajax = require('./ajax')

function Collection(prop) {
  if (prop) {
    for (var i in prop) {
      this[i] = prop[i];
    }
  }
  this.list = [];

  this.init && this.init();
}

$.extend(Collection.prototype, events, ajax, {

  length: function() {
    return this.list.length;
  },

  add: function(data) {
    if (Array.isArray(data)) {
      data.forEach(function(item) {
        this.addOne(item);
      }, this);
    } else {
      this.addOne(data);
    }
    this.trigger('change');
  },

  addOne: function(item) {
    var model = new(this.constructor.Model || Model)({
      data: item
    });
    model.collection = this;
    this.trigger('add', model, this.list.push(model) - 1);
  },

  reduce: function(model) {
    this.list.splice(model.index(), 1);
    this.trigger('reduce', model);
    this.trigger('change');
  },

  toArray: function() {
    return this.list.map(function(model) {
      return model.data;
    });
  },

  clear: function(models) {
    (models || this.list).forEach(function(model) {
      models && this.list.splice(model.index(), 1);
      model.view.el.remove();
    }, this);
    !models && (this.list.length = 0);
    this.trigger('reduce');
    this.trigger('change');
    return this;
  }
})

module.exports = Collection