var Model = require('./Model.js')
var events = require('./events.js')
var vjs = require('./vjs.js')

/**
 * @constructor
 * @param {[type]} prop [description]
 */
function View(prop) {

  if (arguments.length > 1) {
    var _init_0 = prop.init;
    for (var i = 1; i < arguments.length; i++) {
      var _prop = arguments[i];
      var _init = _prop.init;
      if (_init) {
        _prop.init = function() {
          _init_0 && _init_0.call(this);
          _init.call(this);
        }
      }
      $.extend(true, prop, _prop);
    }
  }

  if (prop) {

    if (typeof prop.init === 'function' && typeof this.init === 'function') {
      var _this = this.init;
      var _init = prop.init;
      prop.init = function() {
        _this.call(this);
        _init.call(this);
      };
    }

    if (prop.className && this.className) {
      prop.className = this.className + ' ' + prop.className;
    }

    for (var k in prop) {
      if (k === 'events') {
        this[k] = $.extend(true, {}, this[k], prop[k]);
      } else {
        this[k] = prop[k];
      }
    }

  }

  this.model instanceof Model || (this.model = new(this.Model || Model)(this.model));

  this.model.view = this;

  this.model.collection && (this.collection = this.model.collection);

  // Events
  this.listen(this.model, 'reset', this.render);

  this.tag && (this.el = $('<' + this.tag + '>'));
  typeof this.el === 'string' && this.el.indexOf('#') === 0 && (this.el = $(this.el));
  typeof this.template === 'string' && this.template.indexOf('#') === 0 && this.getTemplate();

  if (typeof this.el === 'object') {
    this.delegateEvents();
    !this.tag && typeof this.template === 'string' && this.getTemplate();
    this.className && this.el.addClass(this.className);
  }

  this.init && this.init()
}

$.extend(View.prototype, events, {

  /**
   * 在当前 view 容器下查询子元素，与 this.el.find 等效
   * @param  {string} selector 子元素选择器
   * @return {object}          子元素 jQuery 对象
   */
  $: function(selector) {
    return this.el.find(selector);
  },

  render: function() {
    this.trigger('render:before');
    this.template && this.el.html(this.template(this.model.data));
    this.trigger('render:after');
    return this.el;
  },

  setElement: function(el) {
    this.el = el;
    this.delegateEvents();
  },

  remove: function() {
    this.model.remove();
  },

  getTemplate: function() {
    var template = vjs((
      this.template.indexOf('.') === 0 ? this.$(this.template) : $(this.template)).html());
    if (!template) throw '"' + this.template + '" not exist';
    if (this.hasOwnProperty('template')) {
      this.template = template;
    } else {
      delete this.template;
      this.constructor.prototype.template = template;
    }
  },

  // Bind events using events delegation, this methdo was opened because sometimes the
  // subView events need to be rebind manual because jQuery html will clean the events if
  // the parentView use html to add a childView.
  delegateEvents: function() {
    // events is a collection of dom events of the view
    if (!this.events) return;
    // Remove events avoid repeat events
    this.el.off('.trunk_delegateEvents');
    for (var k in this.events) {
      var event = this.events[k];
      if (!this[event]) throw 'Event handle "' + event + '" not existed';
      k = k.split(' ');
      var args = [k.shift()];
      args.push(k.join(' '));
      this.el.on(args[0] + '.trunk_delegateEvents', args[1], this[event].bind(this));
    }
  }
})

module.exports = View