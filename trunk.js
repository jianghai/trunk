/**
 * Framework
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
        this.init && this.init();
        this.attr = $.extend(true, {}, this.defaults, attr);
        this.trigger('create');
    };

    Model.prototype = {

        set: function(attr, validate) {
            if (attr instanceof Object) {

                // Validate if set
                if (validate !== false && typeof this.validate === 'function') {
                    if (!this.validate(attr)) return;
                }

                // Check if really changed 
                // ...
                $.extend(this.attr, attr);
                this.trigger('change', attr);
                this.models && this.models.trigger('change');
                return true;
            }
        },

        remove: function() {
            this.view.el.remove();
            this.models.reduce(this);
        },

        // Insert a model after this to this.models
        after: function(attr) {
            var model = new this.constructor(attr);
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
        }
    };

    var Models = function() {
        this.list = [];
        // Create relationship between single model and it's models
        this.model.prototype.models = this;
    };

    Models.prototype = {

        add: function(attr) {
            var model = new this.model(attr);
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
                fn.call(null, n);
            });
        }

    };


    var View = function() {
        $.extend(true, this, arguments[0]);
        this.model && (this.model.view = this);
        this.model && this.model.models && (this.models = this.model.models);

        if (!this.el && this.tag) {
            this.el = $('<' + this.tag + '>');
        }

        if (this.events) {
            // events is a collection of dom events of the view
            var _this = this;

            $.each(this.events, function(k, v) {

                k = k.split(' ');

                // Property el must be set and exist in dom
                _this.el.on(k[0], k[1], _this[v].bind(_this));
            });
        }
        this.init && this.init();
    };

    View.prototype = {

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
    Trunk.Model = Model;
    Trunk.Models = Models;
    Trunk.View = View;
    Trunk.Router = Router;

    Trunk.Model.extend = Trunk.Models.extend = Trunk.View.extend = Trunk.Router.extend = extend;

    this.Trunk = Trunk;

}).call(this);