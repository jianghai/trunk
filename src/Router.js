var $ = require('jquery')

function Router(prop) {

  for (var i in prop) {
    this[i] = prop[i]
  }

  this.init && this.init()

  // Bind router rules
  for (var rule in this.router) {
    var handle = this[this.router[rule]]
    if (Router.routers) {
      if (Router.routers[rule]) {
        Router.routers[rule].push(handle)
      } else {
        Router.routers[rule] = [handle]
      }
    } else {
      Router.routers = {}
      Router.routers[rule] = [handle]
    }
    if (/\*|\:/.test(rule)) {
      if (!Router.regs) {
        Router.regs = {}
      }
      var reg = rule.replace(/:[^\/.]+/g, '(.+)')
        .replace(/\*/g, '(.*)')
        .replace(/\//g, '\\\/')
      reg = '^' + reg + '$'
      Router.regs[rule] = new RegExp(reg)
    }
  }

  // Listen hash change and trigger handles of router rules 
  if (!Router.isListen) {

    var onHash = function() {
      var hash = location.hash.slice(1).split('?')
      Trunk.get = null
      if (hash[1]) {
        var param = {}
        hash[1].split('&').forEach(function(query) {
          var query = query.split('=')
          // Don't forget to decode the query string
          query[1] = decodeURIComponent(query[1])
          if (query[0] in param) {
            if (!Array.isArray(param[query[0]])) {
              param[query[0]] = [param[query[0]]]
            }
            param[query[0]].push(query[1])
          } else {
            param[query[0]] = query[1]
          }
        })
        Trunk.get = param
      }
      hash = hash[0]
      if (Router.routers[hash]) {
        // Execute every handle
        Router.routers[hash].forEach(function(handle) {
          handle.call(this)
        }, this)
      } else {
        for (var k in Router.regs) {
          var match, reg = Router.regs[k]
          if (match = hash.match(reg)) {
            match.shift()
            Router.routers[k].forEach(function(handle) {
              handle.apply(this, match)
            }, this)
            return false
          }
        }
      }
    }

    $(win).on('hashchange', onHash)

    // Default hash handle when dom is ready
    $(onHash)

    Router.isListen = true
  }
}

module.exports = Router