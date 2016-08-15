var assert = require('assert');

var moment = require('moment');
module.exports = {
 "insertDocument" : function(db,query, callback) {
   db.collection('searchresults').insertOne( {
       "query":query,
       "when":moment().format()
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the searchresults collection.");
  });
},
"queryresults":function(db,callback){
    var cursor = db.collection('searchresults').find();
    cursor.toArray(function(err,result)
    {
        if(err) throw err;
        callback(null, result); 
    })
    
    
}
};