var $ = require('jquery')
var _ = require('./util')


/**
 * 类继承机制
 * ```js
 * var List = Trunk.extend({})
 * List.Model = Trunk.Model.extend({})
 * var MyList = List.extend({})
 * MyList.Model = List.Model.extend({})
 * ```
 * @module
 * @param {Object} attributes 扩展属性
 * @return {Function} 子类，子类可以继续被继承
 */
function extend(attributes) {
  var Super = this
  var Subclass = function() {
    Super.apply(this, arguments)
  }

  // 继承Model
  Super.Model && (Subclass.Model = Super.Model)

  Subclass.extend = extend

  if (Object.create) {
    Subclass.prototype = Object.create(Super.prototype)
  } else {
    var F = function() {}
    F.prototype = Super.prototype
    Subclass.prototype = new F()
  }
  Subclass.prototype.constructor = Subclass

  _.mergeAttributes.call(Subclass.prototype, attributes)

  return Subclass
}

module.exports = extend