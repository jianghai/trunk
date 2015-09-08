var config     = require('../config')

var directives = {
  model: require('./model')
}
Object.keys(directives).forEach(function(key) {
  directives[config.d_prefix + key] = directives[key]
  delete directives[key]
})
module.exports = directives