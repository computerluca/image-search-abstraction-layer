var express = require('express')
var request = require('request');
var app = express();
require('dotenv').load();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var search = require('./mongo/search.js');
app.get('/search/latest',function(req,resp){
  MongoClient.connect(url, function(err,db) {
  assert.equal(null, err);
 search.queryresults(db,function(err,data) {
    if(err) throw err;
      if(data && data.length>0){
      resp.end(JSON.stringify(data));
      }
      else{
        resp.end("No recent search result found");
      }
      db.close();
  });
  
});
});
app.get('/search/:query',function(req,resp){
  var query_string = req.params.query;
  var offset = req.query.offset;

  if(!offset){
    resp.end("Offset is required");
  }
  if(isNaN(offset)){
    resp.end("Offset must be an integer");
  }
  var result = "?q="+query_string+"&count=10&offset="+offset;
  if(result.length>2048){
    resp.end("Request cannot exceed 2048 caracters");
  }
    var options = {
  url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search'+result,
  headers: {
    'Ocp-Apim-Subscription-Key': process.env.API_KEY
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    var object = [];
    for(var i=0;i<info.value.length;i++){
      object.push({"alttext":info.value[i].name,"thumbnailUrl":info.value[i].thumbnailUrl,"contentUrl":info.value[i].contentUrl,"hostPageDisplayUrl":info.value[i].hostPageDisplayUrl});
    }
    if(object.length>0){
      MongoClient.connect(url, function(err,db) {
  assert.equal(null, err);
  search.insertDocument(db, query_string,function() {
      db.close();
  });
});
      resp.end(JSON.stringify(object));
    }
    else{
      resp.end("No result found on your search");
    }
   
  }
  else{
    resp.end("Something went wrong! Retry the request");
  }
}

request(options, callback);
    
})

app.listen(8080);
