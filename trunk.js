/**
 * My Backbone, jQuery required
 */

(function() {

    // Caller as array method
    var _arr = [];

    // Event driven model
    var events = {

        on: function(name, handle) {
            if (this._events) {
                if (this._events[name]) {
                    this._events[name].push(handle);
                } else {
                    this._events[name] = [handle];
                }
            } else {
                this._events = {};
                this._events[name] = [handle];
            }
        },

        one: function(name, handle) {
            var _this = this;
            this.on(name, function() {
                handle.apply(_this, arguments);
                _this.off(name, arguments.callee);
            });
        },

        off: function(name, handle) {
            if (this._events) {
                if (!handle) {
                    delete this._events[name];
                } else {
                    this._events[name].splice($.inArray(handle, this._events), 1);
                    if (!this._events[name].length) {
                        delete this._events[name];
                    }
                }
            }
        },

        /**
         * Different from on is that the method listen could listen the first parameter
         * events and keyword this of the event handle is the caller of method listen
         */
        listen: function(obj, name, handle) {
            this.on.call(obj, name, handle.bind(this));
        },

        trigger: function(name) {
            var _this;
            var _param;
            if (this._events && this._events[name]) {
                _this = this;
                _param = _arr.slice.call(arguments, 1);
                $.each(this._events[name], function(i, n) {
                    n.apply(_this, _param);
                });
            }
        }
    };


    /**
     * This method must be called by a constructor(parent), return a constructor(child)
     * whose protptype chain was extended by prototype of parent, arguments[0] and events.
     */
    var extend = function(obj) {
        var Parent = this;
        var Child = function() {
            Parent.apply(this, arguments);
        };
        $.extend(true, Child.prototype, events, Parent.prototype, obj);

        // Make it could be extended
        Child.extend = extend;

        return Child;
    };

    var Model = function(attr) {
        if (typeof this.validate === 'function') {
            this.validError = {};
        }
        this.init && this.init();
        this.attr = $.extend(true, {}, this.defaults, attr);
        this.trigger('create');
    };

    Model.prototype = {

        // Why not just read the property 'attr' to get what you want, Because by this method,
        // the return value could be deep copied.
        get: function(prop) {
            var value = this.attr[prop];
            var isObject = $.isPlainObject(value);
            var isArray = $.isArray(value);
            if (isObject || isArray) {
                return $.extend(true, isObject && {} || [], value);
            }
            return value;
        },

        set: function(attr, validate) {
            // if (attr instanceof Object) {

                // Validate if set
                if (this.validError && validate !== false) {
                    this.trigger('validate');
                    if (!this.validate(attr)) {
                        this.trigger('invalid', this.validError);
                        return;
                    }
                }

                // Check if really changed 
                // ...
                $.extend(this.attr, attr);
                this.trigger('change', attr);
                this.models && this.models.trigger('change');
                return true;
            // }
        },

        reset: function(attr) {
            this.attr = $.extend(true, {}, this.defaults, attr);
            this.trigger('change', attr);
            this.models && this.models.trigger('change');
        },

        remove: function() {
            this.view.el.remove();
            this.models.reduce(this);
        },

        // Insert a model after this to this.models
        after: function(attr) {
            var model = new this.constructor(attr);
            model.models = this.models;
            this.models.list.splice(this.index() + 1, 0, model);
            this.models.trigger('add', model);
            this.models.trigger('change');
        },

        // Get index of this.models
        index: function () {
            return $.inArray(this, this.models.list);
        },

        // Get the model before this
        prev: function () {
            return this.models.list[this.index() - 1];
        },

        // Get the model after this
        next: function () {
            return this.models.list[this.index() + 1];
        },

        clone: function() {
            return $.extend(true, {}, this.attr);
        }
    };

    var Models = function() {
        this.list = [];
    };

    Models.prototype = {

        add: function(attr) {
            var model = new this.model(attr);
            model.models = this;
            this.list.push(model);
            this.trigger('add', model);
            this.trigger('change');
        },

        reduce: function(model) {
            var index = $.inArray(model, this.list);
            this.list.splice(index, 1);
            this.trigger('reduce', model);
            this.trigger('change');
        },

        each: function(fn) {
            $.each(this.list, function(i, n) {
                fn.call(null, n, i);
            });
        }

    };


    var View = function() {
        
        $.extend(true, this, arguments[0]);

        if (this.model) {

            // Bind model
            if (typeof this.model === 'function') {
                this.model = new this.model();
            }
            this.modelProperty && $.extend(this.model, this.modelProperty);

            this.model.view = this;

            if (this.model.models) {
                this.models = this.model.models;
            }

            // Events
            this.listen(this.model, 'change', this.render);
        }

        if (!this.el && this.tag) {
            this.el = $('<' + this.tag + '>');
        }
        // this.delegateEvents();
        
        this.init && this.init();
    };

    View.prototype = {

        // Equal to this.el.find()
        $: function(selector) {
            return this.el.find(selector);
        },

        extend: function(property) {
            return $.extend(this, property);
        },

        show: function() {
            this.delegateEvents();
            if (this.model && this.model.fetch) {
                this.model.fetch();
            } else {
                this.render();
            }
        },

        render: function() {
            this.template && this.el.html(this.model && this.template(this.model.attr) || this.template);
            this.onRender();
        },

        // For composite view
        onRender: function() {
            var _this = this;

            this.childViews && $.each(this.childViews, function(name, instance) {
                instance.el = _this.$(instance.el);
                if (instance.template && typeof instance.template !== 'function') {
                    instance.template = vjs(_this.$(instance.template).html());
                }
                instance.show();
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
                this.el.off();

                $.each(this.events, function(k, v) {
                    
                    k = k.split(' ');
                    var args = [k.shift()];
                    args.push(k.join(' '));

                    _this.el.on(args[0], args[1], _this[v].bind(_this));
                });
            }
        }
    };


    var Router = function() {

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
                    .replace(/\*/g, '(.+)')
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

            $(window).on('hashchange', onHash);

            // Default hash handle when dom is ready
            $(onHash);

            Router.isListen = true;
        }
    };

    var Trunk = {};

    Trunk.events = events;
    Trunk.Model  = Model;
    Trunk.Models = Models;
    Trunk.View   = View;
    Trunk.Router = Router;

    Trunk.Model.extend = Trunk.Models.extend = Trunk.View.extend = Trunk.Router.extend = extend;

    this.Trunk = Trunk;

}).call(this);