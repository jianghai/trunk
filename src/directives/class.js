var _ = require('../util')

module.exports = function(element, map, scope) {
  _.mapParse(map, function(name, condition) {
    this.addDeps(condition, function(value) {
      _.toggleClass(element, name, value)
    }, scope)
    _.toggleClass(element, name, this.get(condition, scope))
  }, this)
}