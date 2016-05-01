/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app')
var Funnel = require('broccoli-funnel')

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  var CesiumAsset = new Funnel('vendor/cesium/')

  app.import('vendor/cesium/Cesium/Cesium.js')
  app.import('vendor/cesium/Cesium/Widgets/widgets.css')
  app.import('vendor/sparql-client/SparqlClient.js')

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  return app.toTree(CesiumAsset)
};
