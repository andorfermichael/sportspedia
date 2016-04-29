import $ from 'jquery'
import dps from 'dbpedia-sparql-client';
const query = `SELECT DISTINCT ?StadiumOrArena WHERE {[] a ?StadiumOrArena} LIMIT 10`;
 
dps
  .client() 
  .query(query)
  .timeout(15000) // optional, defaults to 10000
  .asJson()       // or asXml()
  .then(r => { /* handle success */})
  .catch(e => { /* handle error */});


//$('h1').html('Hello, World!')
