/**
 * Trunk.js v0.1
 * Available via the MIT license
 * see: http://github.com/jianghai for details.
 */

'use strict';

var a = 1;

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD module
    define('trunk', ['jquery', 'vjs'], function($, vjs) {
      return factory(root, $, vjs)
    });
  } else {
    root.Trunk = factory(root, jQuery, vjs);
  }

})(window, function(win, $, vjs) {

  // Caller as array method
  var array = [];

  var slice = array.slice;

  // Event driven model
  var events = {

    on: function(name, handle, context) {
      this._events || (this._events = {});
      (this._events[name] || (this._events[name] = [])).push({
        handle: handle,
        context: context || this
      });
      return this;
    },

    once: function(name, handle, context) {
      var self = this;
      var once = function() {
        handle.apply(this, arguments);
        self.off(name, once);
      };
      return this.on(name, once, context);
    },

    off: function(name, handle) {
      if (!this._events) return this;
      name || (this._events = {});
      handle || (this._events[name] = []);
      var events = this._events[name];
      if (!events.length) return this;
      var remaining = [];
      for (var i = 0, len = events.length; i < len; i++) {
        events[i].handle !== handle && remaining.push(events[i]);
      }
      this._events[name] = remaining;
      return this;
    },

    /**
     * Change target event context to caller of listen
     */
    listen: function(obj, name, handle) {
      obj.on(name, handle, this);
      return this;
    },

    listenOnce: function(obj, name, handle) {
      obj.once(name, handle, this);
      return this;
    },

    trigger: function(name) {
      if (!this._events || !this._events[name]) return this;
      var self = this;
      var param = slice.call(arguments, 1);
      var events = this._events[name];
      for (var i = 0, len = events.length; i < len; i++) {
        events[i].handle.apply(events[i].context, param);
      }
      return this;
    }
  };


  /**
   * Class inherit
   */
  var extend = function(prop) {
    var Super = this;
    var Subclass = function() {
      Super.apply(this, arguments);
    };

    Subclass.extend = extend;

    if (Object.create) {
      Subclass.prototype = Object.create(Super.prototype);
    } else {
      var F = function() {}
      F.prototype = Super.prototype;
      Subclass.prototype = new F();
    }
    Subclass.prototype.constructor = Subclass;

    if (typeof Subclass.prototype.init === 'function' && typeof prop.init === 'function') {
      var _sub = Subclass.prototype.init;
      var _prop = prop.init;
      prop.init = function() {
        _sub.call(this);
        _prop.call(this);
      }
    }

    for (var k in prop) {
      if (Subclass.prototype[k] && typeof Subclass.prototype[k] === 'object') {
        Subclass.prototype[k] = $.extend(true, {}, Subclass.prototype[k], prop[k]);
      } else {
        Subclass.prototype[k] = prop[k];
      }
    }

    return Subclass;
  };

  var Model = function(prop) {

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
  };

  var ajax = {

    setParam: function(param, silent) {

      this.param || (this.param = {});

      if (typeof param === 'string') {
        var _key = param;
        param = {};
        param[_key] = silent;
        silent = arguments[2];
      }

      for (var k in param) {
        var val = param[k];
        if (val || val === 0) {
          this.param[k] = val;
        } else {
          delete this.param[k];
        }
      }

      !silent && this.fetch();
    },

    onDone: function(res) {
      this.trigger('sync', res);
      this.onFetch(res);
    },

    fetch: function() {
      var self = this;
      this.trigger('request');
      $.ajax({
        url: this.url,
        data: this.param
      }).done(this.onDone.bind(this));
    }
  };

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
      this.trigger('reset', data);
      this.collection && this.collection.trigger('change');
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
  });

  var Collection = function(prop) {
    if (prop) {
      for (var i in prop) {
        this[i] = prop[i];
      }
    }
    this.list = [];

    this.init && this.init();
  };

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
      var model = new(this.Model || Model)({
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
  });


  var View = function(prop) {

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

    this.children = [];

    this.init && this.init();
  };

  $.extend(View.prototype, events, {

    // Equal to this.el.find()
    $: function(selector) {
      return this.el.find(selector);
    },

    render: function() {
      this.trigger('render:before');
      this.template && this.el.html(this.template(this.model.data));
      this.trigger('render:after');
      this.children && this.renderChildren();
      return this.el;
    },

    // For nested view
    renderChildren: function() {
      for (var i = 0, len = this.children.length; i < len; i++) {
        var child = this.children[i];
        typeof child.el === 'string' && (child._el = child.el);
        child._el && (child.el = this.$(child._el)) && child.delegateEvents();

        typeof child.template === 'string' && child.getTemplate();

        if (child.silent) continue;

        (child.model.url || child.model.fetch !== Model.prototype.fetch) ? child.model.fetch(): child.render();
      }
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
  });


  var Router = function(prop) {

    for (var i in prop) {
      this[i] = prop[i];
    }

    this.init && this.init();

    // Bind router rules
    for (var rule in this.router) {
      var handle = this[this.router[rule]];
      if (Router.routers) {
        if (Router.routers[rule]) {
          Router.routers[rule].push(handle);
        } else {
          Router.routers[rule] = [handle];
        }
      } else {
        Router.routers = {};
        Router.routers[rule] = [handle];
      }
      if (/\*|\:/.test(rule)) {
        if (!Router.regs) {
          Router.regs = {};
        }
        var reg = rule.replace(/:[^\/.]+/g, '(.+)')
          .replace(/\*/g, '(.*)')
          .replace(/\//g, '\\\/');
        reg = '^' + reg + '$';
        Router.regs[rule] = new RegExp(reg);
      }
    }

    // Listen hash change and trigger handles of router rules 
    if (!Router.isListen) {

      var onHash = function() {
        var hash = location.hash.slice(1).split('?');
        Trunk.get = null;
        if (hash[1]) {
          var param = {};
          hash[1].split('&').forEach(function(query) {
            var query = query.split('=');
            // Don't forget to decode the query string
            query[1] = decodeURIComponent(query[1]);
            if (query[0] in param) {
              if (!Array.isArray(param[query[0]])) {
                param[query[0]] = [param[query[0]]];
              }
              param[query[0]].push(query[1]);
            } else {
              param[query[0]] = query[1];
            }
          });
          Trunk.get = param;
        }
        hash = hash[0];
        if (Router.routers[hash]) {
          // Execute every handle
          Router.routers[hash].forEach(function(handle) {
            handle.call(this);
          }, this);
        } else {
          for (var k in Router.regs) {
            var match, reg = Router.regs[k];
            if (match = hash.match(reg)) {
              match.shift();
              Router.routers[k].forEach(function(handle) {
                handle.apply(this, match);
              }, this);
              return false;
            }
          }
        }
      };

      $(win).on('hashchange', onHash);

      // Default hash handle when dom is ready
      $(onHash);

      Router.isListen = true;
    }
  };

  var Trunk = {};

  Trunk.events = events;
  Trunk.Model = Model;
  Trunk.Collection = Collection;
  Trunk.View = View;
  Trunk.Router = Router;

  Trunk.Model.extend = Trunk.Collection.extend = Trunk.View.extend = Trunk.Router.extend = extend;

  return Trunk;
});