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

    one: function(name, handle, context) {
      var self = this;
      var one = function() {
        handle.apply(this, arguments);
        self.off(name, one);
      };
      return this.on(name, one, context);
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
   * This method must be called by a constructor(parent), return a constructor(child)
   * whose protptype chain was extended by prototype of parent, arguments[0] and events.
   */
  var extend = function(protoProps) {
    var Parent = this;
    var Child = function() {
      Parent.apply(this, arguments);
    };

    // var F = function() {
    //   this.constructor = Child;
    // };
    // F.prototype = Parent.prototype;
    // Child.prototype = new F();

    if (typeof Parent.prototype.init === 'function' && typeof protoProps.init === 'function') {
      var temp = protoProps.init;
      protoProps.init = function() {
        Parent.prototype.init.call(this);
        temp.call(this);
      };
    }

    // $.extend(true, Child.prototype,  protoProps);
    $.extend(true, Child.prototype, Parent.prototype, protoProps);

    // Make it could be extended
    Child.extend = extend;

    return Child;
  };

  var Model = function(prop) {

    for (var i in prop) {
      this[i] = prop[i];
    }

    this.data = $.extend(true, {}, this.defaults, this.data);

    this.trigger('create');

    this.init && this.init();
  };

  $.extend(Model.prototype, events, {

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
        this.models && this.models.trigger('change');
      }
      return true;
    },

    reset: function(data) {
      this.data = $.extend({}, this.defaults, data);
      // this.trigger('change', data);
      this.trigger('reset', data);
      this.models && this.models.trigger('change');
    },

    remove: function() {
      this.view.el.remove();
      this.models.reduce(this);
    },

    // Insert a model after this to this.models
    after: function(data) {
      var model = new this.constructor({
        data: data
      });
      model.models = this.models;
      this.models.list.splice(this.index() + 1, 0, model);
      this.models.trigger('add', model);
      this.models.trigger('change');
    },

    // Get index of this.models
    index: function() {
      return $.inArray(this, this.models.list);
    },

    // Get the model before this
    prev: function() {
      return this.models.list[this.index() - 1];
    },

    // Get the model after this
    next: function() {
      return this.models.list[this.index() + 1];
    }
  });

  var Models = function(prop) {
    if (prop) {
      for (var i in prop) {
        this[i] = prop[i];
      }
    }
    this.list = [];
  };

  $.extend(Models.prototype, events, {

    length: function() {
      return this.list.length;
    },

    add: function(data) {
      var model = new this.model({
        data: data
      });
      model.models = this;
      this.list.push(model);
      this.trigger('add', model);
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

    if (prop && typeof prop.init === 'function' && typeof this.init === 'function') {
      var _this = this.init;
      var temp = prop.init;
      prop.init = function() {
        _this.call(this);
        temp.call(this);
      };
    }

    for (var i in prop) {
      this[i] = (i === 'events' || i === 'modelProperty')
        ? $.extend(true, {}, this[i], prop[i])
        : prop[i];
    }

    if (this.model || this.modelProperty) {

      // Bind model
      if (this.model) {
        if (typeof this.model === 'function') {
          this.model = new this.model(this.modelProperty);
        }
      } else {
        this.model = new Model(this.modelProperty);
      }

      this.model.view = this;

      if (this.model.models) {
        this.models = this.model.models;
      }

      if (this.model.validate) {
        this.onValidate && this.listen(this.model, 'validate', this.onValidate);
        this.onInvalid && this.listen(this.model, 'invalid', this.onInvalid);
      }

      // Events
      this.listen(this.model, 'reset', this.render);
    }

    this.tag && (this.el = $('<' + this.tag + '>'));
    typeof this.el === 'string' && this.el.indexOf('#') === 0 && (this.el = $(this.el));
    typeof this.template === 'string' && this.template.indexOf('#') === 0 && this.getTemplate();

    if (typeof this.el === 'object') {
      this.delegateEvents();
      !this.tag && typeof this.template === 'string' && this.getTemplate();
      this.className && this.el.addClass(this.className);
    }

    this.init && this.init();
  };

  $.extend(View.prototype, events, {

    // Equal to this.el.find()
    $: function(selector) {
      return this.el.find(selector);
    },

    show: function() {

      // this.getTemplate();

      if (this.model && this.model.fetch) {
        this.model.fetch();
      } else {
        this.render();
      }
    },

    render: function() {

      this.trigger('render:before');

      this.beforeRender && this.beforeRender();

      this.html && this.el.html(this.html);

      this.getTemplate();
      
      this.template && this.el.html(this.template(this.model && this.model.data));

      (this._el || this.tag) && this.delegateEvents();

      this.renderChildren();

      this.trigger('render:after');

      this.afterRender && this.afterRender();

      return this.el;
    },

    getTemplate: function() {
      if (typeof this.template === 'string') {
        var _template = vjs($.call(this.template.indexOf('.') === 0 ? this : null, this.template).html());
        if (!_template) {
          // debugger;
          throw new Error(this.template + ' not exist');
        }
        if (this.hasOwnProperty('template')) {
          this.template = _template;
        } else {
          delete this.template;
          this.constructor.prototype.template = _template;
        }
      }
    },

    // For composite view
    renderChildren: function() {
      var _this = this;

      this.childViews && $.each(this.childViews, function(name, child) {

        child.parent = _this;

        if (typeof child.el === 'string') {
          child._el = child.el;
        }

        child._el && (child.el = _this.$(child._el)) && child.delegateEvents();

        child.getTemplate();

        !child.silent && child.show();
      });
    },

    // Bind events using events delegation, this methdo was opened because sometimes the
    // subView events need to be rebind manual because jQuery html will clean the events if
    // the parentView use html to add a childView.
    delegateEvents: function() {
      if (this.events) {
        // events is a collection of dom events of the view
        var _this = this;

        // Remove events avoid repeat events
        this.el.off('.trunk_delegateEvents');

        $.each(this.events, function(k, v) {

          k = k.split(' ');
          var args = [k.shift()];
          args.push(k.join(' '));

          try {
            _this.el.on(args[0] + '.trunk_delegateEvents', args[1], _this[v].bind(_this));
          } catch (e) {
            if (!_this[v]) {
              throw 'Event handle ' + v + ' not existed.'
            }
          }
        });
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
  Trunk.Models = Models;
  Trunk.View = View;
  Trunk.Router = Router;

  Trunk.Model.extend = Trunk.Models.extend = Trunk.View.extend = Trunk.Router.extend = extend;

  return Trunk;
});