import Ember from 'ember';
import $ from 'jquery';
//import dps from 'npm:dbpedia-sparql-client';
//import Cesium from 'vendor/cesium/Cesium';

/*
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
  PREFIX onto: <http://dbpedia.org/ontology/>
  SELECT * WHERE {
  ?s a onto:SportFacility .
    ?s geo:lat ?lat .
    ?s geo:long ?long .
    FILTER ( ?long > 13.033229 - 0.1 && ?long < 13.033229 + 0.1 && ?lat > 47.811195 - 0.1 && ?lat < 47.811195 + 0.1 )
}
*/


export default Ember.Component.extend({
  didRender() {
    var options = {
      fullscreenButton: false,
      homeButton: false,
      sceneModePicker: false,
      geocoder: false,
      timeline: false,
      navigationInstructionsInitiallyVisible: false,
      baseLayerPicker : false
    };
    var viewer = new Cesium.Viewer('cesiumContainer',options);
    var scene = viewer.scene;
    var pinBuilder = new Cesium.PinBuilder();

    //var clock = viewer.clock;
    var currentposition = {
        //Salzburg as default
        latitude: 47.8,
        longitude: 13.0333333
    };

  function morph(target_projection){
    if (target_projection === "2D"){
      scene.morphTo2D();
    }
    else if (target_projection === "3D"){
      scene.morphTo3D();
    }
    else if (target_projection === "Columbus"){
      scene.morphToColumbusView();
    }
  }

  /*
  function spinGlobe(dynamicRate){
    var previousTime = Date.now();
    viewer.clock.onTick.addEventListener(function() {
      var spinRate = dynamicRate;
      var currentTime = Date.now();
      var delta = ( currentTime - previousTime ) / 1000;
      previousTime = currentTime;
      viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
    });
  }
*/

  function toggleControls(option){
    scene.screenSpaceCameraController.enableRotate = option;
    scene.screenSpaceCameraController.enableTranslate = option;
    scene.screenSpaceCameraController.enableZoom = option;
    scene.screenSpaceCameraController.enableTilt = option;
    scene.screenSpaceCameraController.enableLook = option;
  }

  function hideElements(){
    $('.cesium-viewer-animationContainer').toggle();
    $('.cesium-widget-credits').toggle();
  }

  function setView(target = currentposition,height = 3939999.0){
    // to Salzburg
    //viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -4790000.0, 3930000.0));
    //var center = Cesium.Cartesian3.fromDegrees(13.0333333, 47.8, 3930000.0);
    var center = Cesium.Cartesian3.fromDegrees(target.longitude, target.latitude, height);
    viewer.camera.flyTo({
      destination : center
    });
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        currentposition = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        };
      });
    }
  }

  //spinGlobe(0.01);
  setTimeout(function(){
    getLocation();
    setView();
  },3000);
  toggleControls(false);
  hideElements();

  /*$(function() {
    $( "#draggable" ).draggable();
  });
*/
  $('#start-button').click(function(){
    morph("2D");
    $('main').toggle();
    toggleControls(true);
    setTimeout(function(){
      //setView(currentposition,50000);
      getData();
      var entityArray = [];
      entityArray.push({
        name: "Red Bull Arena Salzburg",
        description: "Die Red Bull Arena ist ein österreichisches Fußballstadion am Stadtrand von Salzburg, in der Gemeinde Wals-Siezenheim. Es ist Heimstadion des Bundesligisten FC Red Bull Salzburg sowie des Erstligisten FC Liefering und fasst insgesamt 30.180[2] Zuschauer. Bis nach der Fußball-Europameisterschaft 2008, bei der das Stadion eines der vier Austragungsorte in Österreich war, hieß es EM-Stadion Wals-Siezenheim.",
        coords: {
          latitude: 47.8163445,
          longitude: 12.9981943
        }
      });
      entityArray.push({
        name: "Eisarena Salzburg",
        description: "Das ist Mike's Lieblingsarena",
        coords: {
          latitude: 47.797731,
          longitude: 13.059888
        }
      });

      zoomToPins(
        createMultiplePins(entityArray)
      );

      //toggleInfoBox();
    },4000);

  });

  //PINS
  function createSinglePin(entity,pin_img = 'Assets/Textures/maki/marker-stroked.png'){
    /*
    entity Element expected in JSON with following structure
     var entity = {
       name: "this is the stadium name",
       desctiption: "this is the stadium description",
       otherattributes: "and much more",
       image: "external image url",
       coords: {
         longitude: 12.9922660309,
         latitude: 47.8097550943
       }
     }
    }
     */
    var url = Cesium.buildModuleUrl(pin_img);
    var Pin = Cesium.when(pinBuilder.fromUrl(url, Cesium.Color.WHITE, 48), function(canvas) {
      return viewer.entities.add({
        name : entity.name,
        description : entity.description,
        //47.8097550943 12.9922660309
        position : Cesium.Cartesian3.fromDegrees(entity.coords.longitude,entity.coords.latitude),
        billboard : {
          image : canvas.toDataURL(),
          verticalOrigin : Cesium.VerticalOrigin.BOTTOM
        },
        point: {
          pixelSize: 5,
          color:  Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label:  {
          text : entity.name,
          font : '14pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth : 2,
          verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
          pixelOffset : new Cesium.Cartesian2(0, 20)
        }
      });
    });
    return Pin;
  }

  function createMultiplePins(entityArray){
    //See createSinglePin function for reference of the structure of entity
    var PinCollection = [];
    for (var i = 0; i < entityArray.length; i++) {
        PinCollection.push(createSinglePin(entityArray[i]));
      }
    return PinCollection;
  }

  function zoomToPins(pinsarray){
    //Since some of the pins are created asynchronously, wait for them all to load before zooming/
    Cesium.when.all(pinsarray, function(pins){
      viewer.flyTo(pins);
    });
  }

  function getData() {
    const querySportsstadium = 'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>'+
      'PREFIX onto: <http://dbpedia.org/ontology/>' +
      'SELECT * WHERE {' +
      '?s a onto:SportFacility .' +
      '?s geo:lat ?lat .' +
      '?s geo:long ?long .' +
      'FILTER ( ?long > 13.033229 - 0.1 && ?long < 13.033229 + 0.1 && ?lat > 47.811195 - 0.1 && ?lat < 47.811195 + 0.1 )}';

    SparqlClient
      .client()
      .query(querySportsstadium)
      .timeout(15000) // optional, defaults to 10000
      .asJson()       // or asXml()
      .then(r => { console.log(querySportsstadium)})
      .catch(e => { console.log("the query can not be fulfilled")});
  }


}
});
