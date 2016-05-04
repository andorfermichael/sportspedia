import Ember from 'ember';
import $ from 'jquery';
import dp from 'npm:dbpedia-sparql-client';
const dps = dp.default;

export default Ember.Component.extend({

  // Define which widgets should be rendered
  didRender() {
    var options = {
      fullscreenButton: false,
      homeButton: false,
      sceneModePicker: false,
      timeline: false,
      navigationInstructionsInitiallyVisible: false,
      baseLayerPicker : false,
      geocoder: false
    };

    // Define fundamental settings
    var viewer = new Cesium.Viewer('cesiumContainer', options);
    var scene = viewer.scene;
    var pinBuilder = new Cesium.PinBuilder();
    var lastCameraPosition = new Cesium.Cartesian3();

    // Camera starts to move
    viewer.camera.moveStart.addEventListener(function() {
      lastCameraPosition = viewer.camera.position;
    });

    // Camera stops to move
    viewer.camera.moveEnd.addEventListener(function() {
      // Get position information when camera stopped moving
      var position = {
        longitude:  (viewer.camera.positionCartographic.longitude * 180 / Math.PI),
        latitude:   (viewer.camera.positionCartographic.latitude * 180 / Math.PI),
        height:      viewer.camera.positionCartographic.height
      };

      // Reset entities
      var entityArray = [];

      // Get sports facilities as promise
      var sportsFacilities = getSportsFacilities(position);

      // Resolve promise
      sportsFacilities.then(function (data){
        var facilities = data.results.bindings;

        // Process each entity
        for (let entity of facilities){
          // Set maximum number of simultaneously displayed entities
          if (entityArray.length === 100) {
            break;
          }

          // Create entity and add it to array
          entityArray.push({
            name: entity.name.value,
            description: generateDescription(entity),
            coords: {
              latitude: parseFloat(entity.lat.value),
              longitude: parseFloat(entity.long.value)
            }
          });
        }

        // Create a pin collection
        createMultiplePins(entityArray);
      });
    });

    // Define Salzburg as default current position
    var currentposition = {
        latitude: 47.8,
        longitude: 13.0333333,
        height: 0
    };

    // Decide how the map should be projected
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

    // Define if controls are enabled or not
    function toggleControls(option){
      scene.screenSpaceCameraController.enableRotate = option;
      scene.screenSpaceCameraController.enableTranslate = option;
      scene.screenSpaceCameraController.enableZoom = option;
      scene.screenSpaceCameraController.enableTilt = option;
      scene.screenSpaceCameraController.enableLook = option;
    }

    // Hide cesium elements
    function hideElements(){
      $('.cesium-viewer-animationContainer').toggle();
    }

    // Sets the center of the view and moves the camera to this point
    function setView(target = currentposition, height = 3939999.0){
      var center = Cesium.Cartesian3.fromDegrees(target.longitude, target.latitude, height);
      viewer.camera.flyTo({
        destination : center
      });
    }

    // Provides the current location as object of longitude and latitude
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

    // Wait a specific time so that the map and its components can be rendered
    // afterwards camera is moved to the current location
    setTimeout(function(){
      getLocation();
      setView();
    }, 3000);

    // Turn off controls on start page and hide elements
    toggleControls(false);
    hideElements();

    // Start button pressed
    $('#start-button').click(function(){
      // Define projection
      morph("2D");

      // Hide start container
      $('main').toggle();

      // Turn on controls
      toggleControls(true);

      // Wait a specific time so that components can be rendered
      // afterwards move camera to the current position
      setTimeout(function(){
        setView(currentposition, 50000);
      }, 4000);
    });

    // Generate and return description container content as plain html
    function generateDescription(entity) {
      var imageurl =  entity.thumbnail.value;
      imageurl = entity.thumbnail.value.substring(0, imageurl.indexOf('?'));

      var description = `
        <center>
          <a href="${imageurl}" target="_blank"><img src="${entity.thumbnail.value}"></a>
        </center>
        <p>${entity.abstract.value}</p>
        <p>Location: ${entity.location.value.substr(entity.location.value.lastIndexOf('/') + 1)}</p>
      `;

      return description;
    }

    // Create and return a single pin from an given entity and with a given image
    function createSinglePin(entity, pin_img = 'Assets/Textures/maki/marker-stroked.png'){
      var url = Cesium.buildModuleUrl(pin_img);

      // Set pin properties
      var Pin = Cesium.when(pinBuilder.fromUrl(url, Cesium.Color.WHITE, 48), function(canvas) {
        return viewer.entities.add({
          name : entity.name,
          description : entity.description,
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

    // Create and return a collection of pins from an given array of entities
    function createMultiplePins(entityArray){
      // See createSinglePin function for reference of the structure of entity
      var PinCollection = [];

      for (var i = 0; i < entityArray.length; i++) {
          PinCollection.push(createSinglePin(entityArray[i]));
      }

      return PinCollection;
    }

    // Return a promise for fetching sports facilities near to the current position
    function getSportsFacilities(currentPosition){
      // Calculate the radius depending on the current camera  height
      var radius = 0.3;
      if (currentPosition.height !== 0){
        radius = currentPosition.height * (0,13 / 3939999);
      }

      // Create sparql query used for fetching sports facilities and further information around the current location
      var sportsFacilitiesQuery =
        `PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
         PREFIX onto: <http://dbpedia.org/ontology/>
         PREFIX dbpedia: <http://dbpedia.org/resource/>
         SELECT ?thumbnail ?abstract ?location ?name ?lat ?long WHERE {
           ?s a onto:SportFacility .
           ?s onto:thumbnail ?thumbnail .
           ?s dbo:abstract ?abstract .
           ?s dbo:location ?location .
           ?s foaf:name ?name .
           filter(langMatches(lang(?abstract), 'en')) .
           ?s geo:lat ?lat .
           ?s geo:long ?long .
           FILTER ( ?long > ${currentPosition.longitude} - ${radius} && ?long < ${currentPosition.longitude} + ${radius} &&
                    ?lat > ${currentPosition.latitude} - ${radius} && ?lat < ${currentPosition.latitude} + ${radius}
                  )
         }`;

      // Return promise which fetches sports facilities from dbpedia
      return dps
        .client()
        .query(sportsFacilitiesQuery)
        .asJson()
        .catch(e => console.error(e));
    }
  }
});
