var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // requestDistance - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  app.controllers.requestDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLocation if available)
      var lat = app.models.userLocation.lat || app.models.searchLocation.lat;
      var lng = app.models.userLocation.lng || app.models.searchLocation.lng;
      var origin = new google.maps.LatLng(lat, lng);
      var places = app.models.places.get();
      var placesWithDistance = [];

      var service = new google.maps.DistanceMatrixService();

      if (places) {
        for (var i=0; i < places.length; i++) {
          // params must be reset before each request
          var params = {
            origins: [origin],
            destinations: [],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
          };

          // Closure needed for AJAX to assign response to correct places object
          (function(place) {
            // Set the destination
            var destination = new google.maps.LatLng(places[i].geometry.location.lat, places[i].geometry.location.lng);
            params.destinations.push(destination);

            // Request the distance & pass to callback
            // Passing an anonymous function to .getDistanceMatrix() prevents recreating the callback function on every result iteration
            service.getDistanceMatrix(params, function(results, status) { callback(results, status, place); });
          })(places[i]);
        }
      }

      function callback(results, status, place) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
          // Guard against no driving options to destination
          if (results.rows[0].elements[0].distance) {
            // Add distance info to each result
            place.drivingInfo = {
              distance: results.rows[0].elements[0].distance.text
            };
          }
          placesWithDistance.push(place);
          if (placesWithDistance.length === places.length) {
            app.models.places.add(placesWithDistance);
            resolve();
          }
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
      var origin = new google.maps.LatLng(lat, lng);
      var destination = new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng);
      var params = {
        origins: [origin],
        destinations: [destination],
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
          // Add distance and duration info
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
      var origin = new google.maps.LatLng(lat, lng);
      var destination = new google.maps.LatLng(app.models.selectedPlace.lat, app.models.selectedPlace.lng);
      var params = {
        origins: [origin],
        destinations: [destination],
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
          // Add distance and duration info
          app.models.selectedPlace.setTransitInfo(distance, duration);
          resolve();
        }
      }
    });
  };

})();
