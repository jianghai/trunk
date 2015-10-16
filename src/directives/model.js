
var inputHandles = {

  text: function(element, exp, scope) {
    var self = this
    this.addDeps(exp, function(value) {
      element.value === value || (element.value = value)
    }, scope)
    element.value = this.get(exp, scope)
    element.addEventListener('input', function() {
      self.set(exp, this.value, scope)
    })
  },

  checkbox: function(element, exp, scope) {
    var self = this
    this.addDeps(exp, function(value) {
      element.checked === value || (element.checked = value)
    }, scope)
    element.checked = this.get(exp, scope)
    element.addEventListener('change', function() {
      self.set(exp, this.checked, scope)
    })
  }
}

var modelHandles = {

  input: function(element) {
    inputHandles[element.type].apply(this, arguments)
  },
  
  select: function(element, exp) {

  },
  
  textarea: function() {

  }
}

module.exports = function(element, exp, scope) {
  var tag = element.tagName.toLowerCase()
  modelHandles[tag] && modelHandles[tag].apply(this, arguments)
}