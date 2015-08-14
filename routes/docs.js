var express = require('express');
var router = express.Router();
var generate = require('../models/doc_generate.js');

var highlight = require('../../highlight/highlight.js');
// var filters = require('jade').filters;
// filters.highlight = function(source, option) {
//   return highlight(source, option.lang);
// }


function parse(host) {

  var isConstructor = host.hasOwnProperty('constructor')

  if (isConstructor) {
    host.category = 'class'
  } else if (host.type) {
    host.category = 'property'
  } else if (!('module' in host)) {
    host.category = 'method'
  }

  host.desc && host.desc.forEach(function(desc) {
    if (typeof desc === 'object') {
      desc.code = highlight(desc.code, desc.lang)
    }
  })

  if (host.namespace) {
    host.name = host.namespace + '.' + host.name
  }

  if (host.param) {
    var params = host.param.map(function(item) {
      return item.name.join(' | ')
      // return !item.optional ? item.name : '[' + item.name + ']'
    }).join(', ')
    host.fullName = host.name + '( ' + params + ' )'
  } else {
    if (isConstructor || (!'module' in host && !host.type)) {
      host.fullName = host.name + '( )'
    }
  }
}


router.get('/', function(req, res, next) {

  var doc = generate()

  doc.forEach(function(module) {
    parse(module)
    module.props && module.props.forEach(parse)
  })

  res.render('docs', {
    doc: doc,
    page: 'docs'
  });
});

module.exports = router
