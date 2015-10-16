var config = require('../config')

var directives = Object.create(null)

;[
  'click',
  'change',
  'class',
  'if',
  'model',
  'repeat',
  'on'
].forEach(function(directive) {
  directives[config.d_prefix + directive] = require('./' + directive)
})

module.exports = directives