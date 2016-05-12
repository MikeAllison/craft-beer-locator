// Code related to Google Maps Distance Matrix API

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // requestMultiDistance - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  app.controllers.requestMultiDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLocation if available)
      var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
      var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
      var places = app.models.places.get();
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();

      if (places) {
        for (var i=0; i < places.length; i++) {
          params.destinations.push(new google.maps.LatLng(places[i].geometry.location.lat, places[i].geometry.location.lng));
        }
        service.getDistanceMatrix(params, callback);
      }

      function callback(results, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
          for (var i=0; i < results.rows[0].elements.length; i++) {
            // Guard against no driving options to destination
            if (results.rows[0].elements[0].distance) {
              // Add distance info to each result
              places[i].drivingInfo = {
                distance: results.rows[0].elements[i].distance.text,
                duration: results.rows[0].elements[i].duration.text
              };
            }
          }
          // Save distance and duration info
          app.models.places.add(places);
          resolve();
        }
      }
    });
  };

  // requestDrivingDistance - Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
  app.controllers.requestDrivingDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLocation if available)
      var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
      var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };

      // Request the distance & pass to callback
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
          var distance, duration;
          // Guard against no transit option to destination
          if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
            distance = results.rows[0].elements[0].distance.text;
            duration = results.rows[0].elements[0].duration.text;
          }
          // Save distance and duration info
          app.models.selectedPlace.setDrivingInfo(distance, duration);
          resolve();
        }
      }
    });
  };

  // requestTransitDistance - Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
  app.controllers.requestTransitDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLocation if available)
      var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
      var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng)],
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: { modes: [google.maps.TransitMode.SUBWAY] },
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };

      // Request the distance & pass to callback
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
          var distance, duration;
          // Guard against no transit option to destination
          if (results.rows[0].elements[0].distance && results.rows[0].elements[0].duration) {
            distance = results.rows[0].elements[0].distance.text;
            duration = results.rows[0].elements[0].duration.text;
          }
          // Save distance and duration info
          app.models.selectedPlace.setTransitInfo(distance, duration);
          resolve();
        }
      }
    });
  };

})();
