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
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true
    };
    var viewer = new Cesium.Viewer('cesiumContainer',options);
    var scene = viewer.scene;
    //var clock = viewer.clock;

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

  function disableControls(){
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;
  }

  function hideElements(){
    $('.cesium-viewer-animationContainer').toggle();
    $('.cesium-widget-credits').toggle();
  }

  function setView(position){
    // to Salzburg
    //viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -4790000.0, 3930000.0));
    //var center = Cesium.Cartesian3.fromDegrees(13.0333333, 47.8, 3930000.0);
    var center = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 3939999.0);
    viewer.camera.flyTo({
      destination : center,
      options: {
        duration: 12.0
      }
    });
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setView);
    } else {
      setView({
        coords: {
          latitude: 47.8,
          longitude: 13.0333333
        }
      });
    }
  }
  spinGlobe(0.01);
  setTimeout(function(){
    getLocation();
  },5000);
  disableControls();
  hideElements();

  }
});
