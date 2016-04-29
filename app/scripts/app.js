import $ from 'jquery'
import dps from 'dbpedia-sparql-client';
const querySportsstadium = `PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
PREFIX onto: <http://dbpedia.org/ontology/> 

SELECT * WHERE {
  ?s a onto:SportFacility .
  ?s geo:lat ?lat .
  ?s geo:long ?long .
 FILTER ( ?long > 13.033229 - 0.1 && ?long < 13.033229 + 0.1 && ?lat > 47.811195 - 0.1 && ?lat < 47.811195 + 0.1 )
}`;
 
dps
  .client() 
  .query(querySportsstadium)
  .timeout(15000) // optional, defaults to 10000
  .asJson()       // or asXml()
  .then(r => { console.log(querySportsstadium)})
  .catch(e => { console.log("the query can not be fulfilled")});

