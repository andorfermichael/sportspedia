import $ from 'jquery'
import GoogleMapsLoader from 'google-maps'

GoogleMapsLoader.KEY = 'AIzaSyDxsV9gMxYdwLI3yBw-4kz7mOtI90nalLE'
//GoogleMapsLoader.LIBRARIES = ['geometry', 'places']
//GoogleMapsLoader.LANGUAGE = 'en'
//GoogleMapsLoader.REGION = 'AT'

GoogleMapsLoader.onLoad(function(google) {
  $('p').html('Google Maps API loaded successfully!')
})

GoogleMapsLoader.load(function(google) {
  let el = document.getElementById('map')
  let options = {
    KEY: 'AIzaSyDxsV9gMxYdwLI3yBw-4kz7mOtI90nalLE'
  }
  new google.maps.Map(el,options)
})

$('h1').html('Welcome to Sportspedia!')
$('p').html('Google Maps API is loading ...')
