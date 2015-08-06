var express = require('express');
var router = express.Router();
var generate = require('../models/doc_generate.js');

var highlight = require('../../highlight/highlight.js');
// var filters = require('jade').filters;
// filters.highlight = function(source, option) {
//   return highlight(source, option.lang);
// }

var doc = generate()

function codeHighlight(desc) {
  if (typeof desc === 'object') {
    desc.code = highlight(desc.code, desc.lang)
  }
}

doc.forEach(function(module) {
  module.desc && module.desc.forEach(codeHighlight)
  module.props && module.props.forEach(function(prop) {
    prop.desc && prop.desc.forEach(codeHighlight)
  })
})

router.get('/', function(req, res, next) {
  console.log(doc[0].props[1])

  res.render('docs', {
    doc: doc,
    page: 'docs'
  });
});

module.exports = router
