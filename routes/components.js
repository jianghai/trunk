var express = require('express');
var router = express.Router();

var highlight = require('../../highlight/highlight.js');
var filters = require('jade').filters;
filters.highlight = function(source, option) {
  return highlight(source, option.lang);
}

router.use(function(req, res, next) {
  res.locals.components = ['LineColumn'];
  next();
});

router.get('/', function(req, res, next) {
  res.render('components', {
    page: 'components'
  });
});

router.get('/:component.html', function(req, res, next) {
  console.log(req.params);
  res.render('components/' + req.params.component, {
    page: 'components',
    current: req.params.component
  });
});

module.exports = router;
