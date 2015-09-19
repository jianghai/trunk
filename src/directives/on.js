var _ = require('../util')

module.exports = function(element, map, scope) {
  _.mapParse(map, function(type, method) {
    _.on(element, type, method, scope, this)
  }, this)
}