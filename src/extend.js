var $ = require('jquery')
/**
 * Class inherit
 */
function extend(prop) {
  var Super = this;
  var Subclass = function() {
    Super.apply(this, arguments);
  }

  // 继承Model
  Super.Model && (Subclass.Model = Super.Model)

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
}

module.exports = extend