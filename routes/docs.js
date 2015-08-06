var express = require('express');
var router = express.Router();
var generate = require('../models/doc_generate.js');

var highlight = require('../../highlight/highlight.js');
// var filters = require('jade').filters;
// filters.highlight = function(source, option) {
//   return highlight(source, option.lang);
// }

var doc = generate()

doc.forEach(function(module) {
  module.props && module.props.forEach(function(prop) {
    prop.description && prop.description.forEach(function(desc) {
      if (typeof desc === 'object') {
        desc.code = highlight(desc.code, desc.lang)
      }
    })
  })
})

router.get('/', function(req, res, next) {
  console.log(generate())

  res.render('docs', {
    doc: doc,
    page: 'docs'
  });
});

module.exports = router
