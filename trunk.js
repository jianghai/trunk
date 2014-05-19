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
        return Child;
    };

    var Model = function(attr) {
        this.attr = attr || {};
        this.trigger('create');
    };

    Model.prototype = {

        set: function(attr) {
            if (attr instanceof Object) {
                $.extend(this.attr, attr);
                // Check if really changed 
                // ...
                this.trigger('change');
                this.models.trigger('change');
            }
        },

        remove: function() {
            this.view.el.remove();
            this.models.reduce(this);
        }
    };

    var Models = function() {
        // Create relationship between single model and it's models
        this.model.prototype.models = this;
    };

    Models.prototype = {

        list: [],

        add: function(attr) {
            var model = new this.model(attr);
            this.list.push(model);
            this.trigger('add', model);
        },

        reduce: function(model) {
            var index = $.inArray(model, this.list);
            this.list.splice(index, 1);
            this.trigger('reduce', model);
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
        this.init && this.init();
        if (this.events) {
            // events is a collection of dom events of the view
            var _this = this;
            if (!_this.el && _this.tag) {
                _this.el = $('<' + _this.tag + '>');
            }
            $.each(this.events, function(k, v) {

                k = k.split(' ');

                // Property el must be set and exist in dom
                _this.el.on(k[0], k[1], _this[v].bind(_this));
            });
        }
    };

    View.prototype = {

    };


    var Router = function() {

        this.init && this.init();
        
        var _this = this;
        if (!Router.isListen) {

            var onHash = function() {
                var hash = location.hash.slice(1);
                if (Router.routers[hash]) {
                    $.each(Router.routers[hash], function() {
                        this();
                    });
                }
            };

            $(window).on('hashchange', onHash);

            // Default hash handle when dom is ready
            $(onHash);

            Router.isListen = true;
        }
        
        $.each(this.router, function(hash, handle) {
            handle = _this[handle].bind(_this);
            if (Router.routers) {
                if (Router.routers[hash]) {
                   Router.routers[hash].push(handle); 
                } else {
                    Router.routers[hash] = [handle];
                }
            } else {
                Router.routers = {};
                Router.routers[hash] = [handle];
            }
        });
    };

    var Trunk = {};

    Trunk.Model = Model;
    Trunk.Models = Models;
    Trunk.View = View;
    Trunk.Router = Router;

    Trunk.Model.extend = Trunk.Models.extend = Trunk.View.extend = Trunk.Router.extend = extend;

    this.Trunk = Trunk;

}).call(this);