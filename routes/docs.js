var express = require('express');
var router = express.Router();
var generate = require('../models/doc_generate.js');

router.get('/', function(req, res, next) {
  res.render('docs', {
    doc: generate(),
    page: 'docs'
  });
});

module.exports = router
