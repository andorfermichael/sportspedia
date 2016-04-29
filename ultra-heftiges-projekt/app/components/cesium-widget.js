import Ember from 'ember';
import $ from 'jquery';
//import Cesium from 'Cesium/cesium';

export default Ember.Component.extend({
  didRender() {
    var options = {
      fullscreenButton: false,
      homeButton: false,
      infoBox: false,
      seneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false
    };
    var viewer = new Cesium.Viewer('cesiumContainer',options);
    var scene = viewer.scene;
    //var clock = viewer.clock;
    var currentposition = {
        //Salzburg as default
        latitude: 47.8,
        longitude: 13.0333333
    };

  function morph(target_projection){
    if (target_projection == "2D") scene.morphTo2D();
    else if (target_projection == "3D") scene.morphTo3D();
    else if (target_projection == "Columbus") scene.morphToColumbusView();
  }

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

  $('#start-button').click(function(){
    morph("2D");
    $('main').toggle();
    toggleControls(true);
    setTimeout(function(){
      setView(currentposition,50000);
    },4000);
  })

  }
});
