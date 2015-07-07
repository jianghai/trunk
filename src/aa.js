// Helpers
var _ = {

  toArray: function(object) {
    return Array.prototype.slice.call(object, 0);
  },

  empty: function(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
};


function Trunk(options) {

  for (var key in options) {
    this[key] = options[key];

    if (typeof this[key] === 'function') {
      Object.defineProperty(this, key, {
        enumerable: false
      });
    }
  }

  this.data || (this.data = {});

  Object.defineProperty(this, 'el', {
    enumerable: false
  });

  var el = document.querySelector(this.el) || document.body;

  Object.defineProperty(this.data, '_watchers', {
    value: {}
  });

  this.textPattern = new RegExp(this.openRE + '(.+?)' + this.closeRE, 'g');

  this.compile(el, this.data);
}


var p = Trunk.prototype;

/**
 * [compile description]
 * @param  {[type]} node  [description]
 * @param  {[type]} scope [description]
 * @return {[type]}       [description]
 */
p.compile = function(node, scope) {

  if (this.ignoreTags[node.tagName]) return;
  // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
  var handle = this.nodesHandles[node.nodeType];
  if (!handle) return;
  handle.call(this, node, scope);
  _.toArray(node.childNodes).forEach(function(node) {
    this.compile(node, scope);
  }, this);
}

p.compileAttribute = function(attribute, scope) {
  var name = attribute.name;
  if (name.indexOf(this.d_prefix) !== 0) return;
  this.directives[name].call(this, attribute.ownerElement, attribute.value, scope);
}


// Default directive prefix name
p.d_prefix = 'd-';

p.openRE = '{{';

p.closeRE = '}}';


// Much more
p.ignoreTags = {
  SCRIPT: true,
  LINK: true,
  STYLE: true
}

// Handle map for node compile
p.nodesHandles = {

  // ELEMENT_NODE
  1: function(node, scope) {
    _.toArray(node.attributes).forEach(function(attribute) {
      this.compileAttribute(attribute, scope);
    }, this);
  },
  
  // TEXT_NODE
  3: function(node, scope) {
    var value = node.nodeValue;
    if (/^\s*$/.test(value)) return;
    var match;
    var fragments = [];
    var lastIndex = this.textPattern.lastIndex = 0;
    while ((match = this.textPattern.exec(value)) != null) {
      var index = match.index;
      (index > lastIndex) && fragments.push({
        value: value.slice(lastIndex, index)
      });
      fragments.push({
        isBind: true,
        value: match[0],
        model: match[1]
      });
      lastIndex = this.textPattern.lastIndex || index + match[0].length;
    }
    if (lastIndex < value.length) {
      fragments.push({
        value: value.slice(lastIndex)
      });
    }
    var docFrag = document.createDocumentFragment();
    fragments.forEach(function(fragment) {
      
      var textNode = document.createTextNode(fragment.value);
      docFrag.appendChild(textNode);
      
      if (fragment.isBind) {
        var model = fragment.model;
        textNode.nodeValue = this.get(model, scope);
        this.addWatch(model, function(value) {
          textNode.nodeValue = value;
        }, scope);
      }
    }, this);
    node.parentNode.replaceChild(docFrag, node);
  },
  
  // DOCUMENT_NODE
  9: function(node) {
    _.toArray(node.attributes).forEach(compileAttribute, this);
  }
}

p.directives = {

  model: function(element, value, scope) {
    var that = this;
    element.value = this.get(value, scope);
    element.addEventListener('input', function() {
      that.set(value, this.value, scope);
    });
  },

  click: function(element, value, scope) {
    var that = this;
    element.addEventListener('click', function() {
      that[value](scope);
      //The scope of new Function is global, so pass context through the parameter
      // new Function('context', 'context.' + value)(context);
    });
  },

  repeat: function(element, value, scope) {

    value = value.split(' in ');

    element.removeAttribute(this.d_prefix + 'repeat');

    var container = element.parentNode;
    var cloneNode = element.cloneNode(true);
    var docFrag = document.createDocumentFragment();

    function render(list) {
      list && list.forEach(function(item) {
        var _cloneNode = cloneNode.cloneNode(true);
        var _data = {};
        _data[value[0]] = item;

        Object.defineProperties(_data, {
          _parent: {
            value: this.data
          },
          _watchers: {
            value: {}
          }
        });

        this.compile(_cloneNode, _data);
        docFrag.appendChild(_cloneNode);

        // dataBind(list, index);
        // list._dataBind[index].push(function(value) {
        //   compile.call(context, _cloneNode, value);
        // });
      }, this);
      _.empty(container);
      container.appendChild(docFrag);
    }

    render.call(this, this.get(value[1], scope));

    // Rerender when list reset 
    // data._dataBind[value[1]].push(render);

    // Observe list change
    // Object.defineProperties(data[value[1]], {
    //   push: {
    //     configurable: false,
    //     enumerable: false,
    //     writable: false,
    //     value: function() {
    //       Array.prototype.push.apply(this, arguments);
    //       for (var i = 0, len = arguments.length; i < len; i++) {
    //         var _cloneNode = cloneNode.cloneNode(true);
    //         compileNode.call(context, _cloneNode, arguments[i]);
    //         docFrag.appendChild(_cloneNode);
    //       }
    //       container.appendChild(docFrag);
    //     }
    //   },
    //   splice: {
    //     configurable: false,
    //     enumerable: false,
    //     writable: false,
    //     value: function(start, deleteCount) {
    //       Array.prototype.splice.apply(this, arguments);
    //       debugger;
    //       console.dir(docFrag);
    //       for (var i = 0; i < deleteCount; i++) {

    //       }
    //       // for (var i = 0, len = arguments.length; i < len; i++) {
    //       //   var _cloneNode = cloneNode.cloneNode(true);
    //       //   compileNode.call(context, _cloneNode, arguments[i]);
    //       //   docFrag.appendChild(_cloneNode);
    //       // }
    //       // container.appendChild(docFrag);
    //     }
    //   }
    // });

    // Stop compile childNodes
    _.empty(element);
  }
};

Object.keys(p.directives).forEach(function(key) {
  p.directives[p.d_prefix + key] = p.directives[key];
  delete p.directives[key];
});

p.get = function(exp, scope) {
  this.watch(exp, scope);
  var store = scope._watchers[exp];
  return store.lastObj[store.lastKey];
}

p.set = function(exp, value, scope) {
  var store = scope._watchers[exp];
  store.lastObj[store.lastKey] = value;
}

p.watch = function(exp, scope) {
  if (scope._watchers[exp]) return;
  this.initialize(exp, scope);
}

p.initialize = function(exp, scope) {

  var store = scope._watchers[exp] = {};

  var object = scope;
  var _pop = exp;
  var _props = exp.split(/]?\[|]?\./);

  if (_props.length > 1) {
    var _pop = _props.pop();
    for (var i = 0; i < _props.length; i++) {
      var _prop = _props[i];
      object[_prop] || (object[_prop] = {});
      object = object[_prop];
    }
  }

  store.lastObj = object;
  store.lastKey = _pop;

  this.bind(object, _pop);
}

p.bind = function(object, key) {
  if (!object._dataBind) {
    Object.defineProperty(object, '_dataBind', {
      value: {}
    });
  }
  if (!object._dataBind[key]) {
    Object.defineProperty(object._dataBind, key, {
      value: []
    });
    var _value = object[key] || '';
    Object.defineProperty(object, key, {
      enumerable: true,
      get: function() {
        return _value;
      },
      set: function(value) {
        this._dataBind[key].forEach(function(callback) {
          callback(value);
        });
        _value = value;
      }
    });
  }
}

p.addWatch = function(exp, fn, scope) {
  var store = scope._watchers[exp];
  store.lastObj._dataBind[store.lastKey].push(fn);
}