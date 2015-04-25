/**
 * Trunk.js v0.1
 * Available via the MIT license
 * see: http://github.com/jianghai for details.
 */

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD module
    define('trunk', ['jquery', 'vjs'], function($, vjs) {
      return factory(root, $, vjs)
    });
  }

  if (root.jQuery && root.vjs) {
    root.Trunk = factory(root, jQuery, vjs);
  }

})(window, function(win, $, vjs) {

  'use strict';

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
   * Class inherit by multiple Class or entend by mutiple object
   */
  var extend = function() {
    var Parent = this;
    var Child = function() {
      Parent.apply(this, arguments);
    };

    if (Object.create) {
      Child.prototype = Object.create(Parent.prototype);
    } else {
      var F = function() {}
      F.prototype = Parent.prototype;
      Child.prototype = new F();
    }
    Child.prototype.constructor = Child;

    var args = arguments;
    for (var i = 0, len = args.length; i < len; i++) {
      var arg = args[i].prototype || args[i];

      if (typeof arg.init === 'function' && typeof Child.prototype.init === 'function') {
        var _child = Child.prototype.init;
        var _init = arg.init;
        arg.init = function() {
          _child.call(this);
          _init.call(this);
        }
      }

      $.extend(true, Child.prototype, arg);
    }

    return Child;
  };

  var Model = function(prop) {

    if (prop) {
      for (var k in prop) {
        if (prop[k].constructor === Object || prop[k].constructor === Array) {
          this[k] = $.extend(true, {}, this[k], prop[k])
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
        this.param[param] = silent;
        silent = arguments[2];
      } else {
        for (var k in param) {
          var val = param[k];
          if (val || val === 0) {
            this.param[k] = val;
          } else {
            delete this.param[k];
          }
        }
      }
      !silent && this.fetch();
    },

    fetch: function() {
      var self = this;
      this.trigger('request');
      $.ajax({
        url: this.url,
        // data: this.param && $.param(this.param, true)
        data: this.param
      }).done(function(res) {
        if (res === '' || (self.isEmpty && self.isEmpty(res))) {
          return self.trigger('empty');
        }
        self.trigger('sync', res);
        self.onFetch(res);
      }).fail(function(xhr, text_status) {
        text_status !== 'abort' && self.trigger('error');
      });
    }
  };

  $.extend(Model.prototype, events, ajax, {

    onFetch: function(res) {
      this.reset(typeof this.parse === 'function' && this.parse(res) || res);
    },

    // Why not just read the property 'data' to get what you want, Because by this method, the return value could be deep copied.
    get: function(prop) {
      var value = this.data[prop];
      var isObject = $.isPlainObject(value);
      var isArray = $.isArray(value);
      if (isObject || isArray) {
        return $.extend(true, isObject && {} || [], value);
      }
      return value;
    },

    isEqual: function(a, b) {
      var isEqual = true;
      (function check(a, b) {
        if (typeof a !== 'object' || a === null) {
          a !== b && (isEqual = false);
        } else if (typeof b !== 'object') {
          isEqual = false;
        } else {
          if (Object.keys(a).length !== Object.keys(b)) {
            return isEqual = false;
          }
          for (var k in a) {
            typeof a[k] !== 'object' ? a[k] !== b[k] && (isEqual = false) : check(a[k], b[k]);
            if (!isEqual) break;
          }
        }
      })(a, b);

      return isEqual;
    },

    set: function(data, options) {

      if (typeof data === 'string') {
        var _data = data;
        data = {};
        data[_data] = options;
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

      for (var k in data) {
        if (!this.isEqual(data[k], this.data[k])) {
          this.data[k] = data[k];
          this.trigger('change:' + k, data[k]);
        }
      }

      if (options.change !== false) {
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
      this.view.el.remove();
      this.collection.reduce(this);
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
      return $.inArray(this, this.collection.list);
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
  };

  $.extend(Collection.prototype, events, ajax, {

    length: function() {
      return this.list.length;
    },

    add: function(data) {
      var model = new (this.Model || Model)({
        data: data
      });
      model.collection = this;
      this.trigger('add', model, this.list.push(model) - 1);
      this.trigger('change');
    },

    reduce: function(model) {
      var index = !isNaN(model) ? model : $.inArray(model, this.list);
      var _model = this.list[index];
      this.list.splice(index, 1);
      this.trigger('reduce', _model);
      this.trigger('change');
    },

    each: function(fn) {
      $.each(this.list, function(i, n) {
        return fn.call(null, n, i);
      });
    },

    toArray: function() {
      return this.list.map(function(model) {
        return model.data;
      });
    },

    clear: function() {
      while (this.length()) {
        this.list[0].remove();
      }
      return this;
    }
  });


  var View = function(prop) {

    if (arguments.length > 1) {
      array.unshift.call(arguments, true, {});
      prop = $.extend.apply($, arguments);
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

      for (var k in prop) {
        if (prop[k].constructor === Object || prop[k].constructor === Array) {
          this[k] = $.extend(true, {}, this[k], prop[k])
        } else {
          this[k] = prop[k];
        }
      }

    }

    if (this.model || this.Model) {

      this.model instanceof Model || (this.model = new (this.Model || Model)(this.model));

      this.model.view = this;

      this.model.collection && (this.collection = this.model.collection);

      if (this.model.validate) {
        this.onValidate && this.listen(this.model, 'validate', this.onValidate);
        this.onInvalid && this.listen(this.model, 'invalid', this.onInvalid);
      }

      // Events
      this.listen(this.model, 'reset', this.render);

      this.onRequest && this.listen(this.model, 'request', this.onRequest);
      this.onError && this.listen(this.model, 'error', this.onError);
      this.onEmpty && this.listen(this.model, 'empty', this.onEmpty);
    }

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
      this.model && this.template && this.el.html(this.template(this.model && this.model.data));
      this.children && this.renderChildren();
      this.trigger('render:after');
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

        child.model ? child.model.fetch() : child.render();
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

    var _this = this;

    // Bind router rules
    $.each(this.router, function(rule, handle) {
      handle = _this[handle];
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
    });

    // Listen hash change and trigger handles of router rules 
    if (!Router.isListen) {

      var onHash = function() {
        var hash = location.hash.slice(1).split('?');
        Trunk.get = null;
        if (hash[1]) {
          var param = {};
          $.each(hash[1].split('&'), function() {
            var single = this.split('=');
            // Don't forget to decode the query string
            single[1] = decodeURIComponent(single[1]);
            if (single[0] in param) {
              if (!$.isArray(param[single[0]])) {
                param[single[0]] = [param[single[0]]];
              }
              param[single[0]].push(single[1]);
            } else {
              param[single[0]] = single[1];
            }
          });
          Trunk.get = param;
        }
        hash = hash[0];
        if (Router.routers[hash]) {
          $.each(Router.routers[hash], function() {
            this.call(_this);
          });
        } else {
          $.each(Router.regs, function(k, v) {
            var match;
            if (match = hash.match(v)) {
              match.shift();
              $.each(Router.routers[k], function() {
                this.apply(_this, match);
              });
              return false;
            }
          });
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