var express = require('express');
var router = express.Router();

var highlight = require('../../highlight/highlight.js');
var filters = require('jade').filters;
filters.highlight = function(source, option) {
  return highlight(source, option.lang);
}

router.get('/', function(req, res, next) {
  res.render('docs', {
    page: 'docs'
  });
});

module.exports = router;
