var express = require('express');
var assert = require('assert');
var restify = require('restify-clients');
var router = express.Router();

// Creates a JSON client
var client = restify.createJsonClient({
  url: 'http://localhost:4000'
});



/* GET offers listing. */
router.get('/', function(req, res, next) {
  
  client.get('/offers', function(err, request, response, obj) {
    assert.ifError(err);
  
    res.json(obj);
  });

});

router.get('/:id', function(req, res, next) {
  
  client.get(`/offers/${req.params.id}`, function(err, request, response, obj) {
    assert.ifError(err);
  
    res.json(obj);
  });

});

router.put('/:id', function(req, res, next) {
  
  client.put(`/offers/${req.params.id}`, req.body, function(err, request, response, obj) {
    assert.ifError(err);
  
    res.json(obj);
  });

});

router.delete('/:id', function(req, res, next) {
  
  client.del(`/offers/${req.params.id}`, function(err, request, response, obj) {
    assert.ifError(err);
  
    res.json(obj);
  });

});

router.post('/', function(req, res, next) {
  
  client.post(`/offers/`, req.body, function(err, request, response, obj) {
    assert.ifError(err);
  
    res.json(obj);
  });

});

module.exports = router;
