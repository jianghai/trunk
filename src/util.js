module.exports = {

  toArray: function(arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0)
  },

  empty: function(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  },

  merge: function(host, extend) {
    for (var k in extend) {
      extend.hasOwnProperty(k) && (host[k] = extend[k])
    }
  }
}