import Ember from 'ember';
import $ from 'jquery';
import dp from 'npm:dbpedia-sparql-client';
const dps = dp.default;

export default Ember.Component.extend({
  didRender() {
    var options = {
      fullscreenButton: false,
      homeButton: false,
      sceneModePicker: false,
      timeline: false,
      navigationInstructionsInitiallyVisible: false,
      baseLayerPicker : false
    };
    var viewer = new Cesium.Viewer('cesiumContainer',options);
    var scene = viewer.scene;
    var camera = new Cesium.Camera(scene);
    var pinBuilder = new Cesium.PinBuilder();
    var lastCameraPosition = new Cesium.Cartesian3();
    var entityArray = [];

    viewer.camera.moveStart.addEventListener(function() {
      // the camera stopped moving
      lastCameraPosition = viewer.camera.position;
    });
    viewer.camera.moveEnd.addEventListener(function() {
      // the camera stopped moving
      console.log("Camera has been moved");
      var position = {
        longitude:  (viewer.camera.positionCartographic.longitude * 180 / Math.PI),
        latitude:   (viewer.camera.positionCartographic.latitude * 180 / Math.PI),
        height:   viewer.camera.positionCartographic.height
      };
      console.log("Cam-Position: " + position);
      //var entityArray = [];
      //console.log(entityArray);
      // Get sports facilities as promise
      var sportsFacilities = getSportsFacilities(position);
      // Resolve promise
      sportsFacilities.then(function (data){
        var facilities = data.results.bindings;

        for (let entity of facilities){
          console.log(entity.thumbnail.value);
          // Create entity and add it to array
          if (entityArray.length === 100) break;
          entityArray.push({
            name: entity.s.value.substr(entity.s.value.lastIndexOf('/') + 1),
            description: '<img src='+entity.thumbnail.value+'><p>'+ entity.abstract.value+'</p> ', //detailInformation.abstract,
           // thumbnail: entity.thumbnail.value,
            coords: {
              latitude: parseFloat(entity.lat.value),
              longitude: parseFloat(entity.long.value)
            }
          });
        }
        createMultiplePins(entityArray);
      });
     

    });

    //var clock = viewer.clock;
    var currentposition = {
        //Salzburg as default
        latitude: 47.8,
        longitude: 13.0333333,
        height: 0
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

    function toggleControls(option){
      scene.screenSpaceCameraController.enableRotate = option;
      scene.screenSpaceCameraController.enableTranslate = option;
      scene.screenSpaceCameraController.enableZoom = option;
      scene.screenSpaceCameraController.enableTilt = option;
      scene.screenSpaceCameraController.enableLook = option;
    }

    function hideElements(){
      $('.cesium-viewer-animationContainer').toggle();
      //$('.cesium-widget-credits').toggle();
    }

    function setView(target = currentposition, height = 3939999.0){
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

    $('#start-button').click(function(){
      morph("2D");
      $('main').toggle();
      toggleControls(true);

      setTimeout(function(){
        setView(currentposition,50000);

        zoomToPins(
          createMultiplePins(entityArray)
        );

        //toggleInfoBox();
      },4000);

    });

    //PINS
    function createSinglePin(entity,pin_img = 'Assets/Textures/maki/marker-stroked.png'){

      var url = Cesium.buildModuleUrl(pin_img);
      var Pin = Cesium.when(pinBuilder.fromUrl(url, Cesium.Color.WHITE, 48), function(canvas) {
        return viewer.entities.add({
          name : entity.name,
          description : entity.description,
         // thumbnail : entity.thumbnail,
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
      //Since some of the pins are created asynchronously, wait for them all to load before zooming
      Cesium.when.all(pinsarray, function(pins){
        viewer.flyTo(pins);
      });
    }

    function getSportsFacilities(currentPosition){
      var radius = 0.3;
      if (currentPosition.height !== 0){
        radius = currentPosition.height * (0,13 / 3939999);
      }
      console.log("Height: " + currentPosition.height);
      console.log("Radius: " + radius);
      // Create sparql query used for fetching sports facilities around current location
      var sportsFacilitiesQuery =
        `PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
         PREFIX onto: <http://dbpedia.org/ontology/>
         SELECT * WHERE {
           ?s a onto:SportFacility .
           ?s onto:thumbnail ?thumbnail .
           ?s dbo:abstract ?abstract .
           filter(langMatches(lang(?abstract), 'en')) .
           ?s geo:lat ?lat .
           ?s geo:long ?long .
           FILTER ( ?long > ${currentPosition.longitude} - ${radius} && ?long < ${currentPosition.longitude} + ${radius} &&
                    ?lat > ${currentPosition.latitude} - ${radius} && ?lat < ${currentPosition.latitude} + ${radius}
                  )
         }`;
        console.log("sports"+sportsFacilitiesQuery);
      // Return promise which fetches sports facilities from dbpedia
      return dps
        .client()
        .query(sportsFacilitiesQuery)
        .asJson()
        .catch(e => console.error(e));

    }
    
  }
});
