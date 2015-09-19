exports.index = function(parent, child) {
  return Array.prototype.indexOf.call(parent.children, child)
}

exports.toggleClass = function(element, className, condition) {
  element.classList.toggle(className, condition)
}

exports.empty = function(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

exports.on = function(element, type, method, scope, context) {
  element.addEventListener(type, function() {
    typeof scope[method] === 'function' ? scope[method]() : context[method](scope)
  })
}