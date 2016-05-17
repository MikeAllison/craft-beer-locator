// Code related to Google Maps Distance Matrix API

var app = app || {};

(function() {

  app.controllers = app.controllers || {};

  // reqMultiDistance - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  app.controllers.reqMultiDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: [],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();

      var places = app.models.places.get();
      if (!places) {
        reject({ type: 'info', text: 'Your request returned no results.' });
        return;
      }

      for (var i=0; i < places.length; i++) {
        params.destinations.push(new google.maps.LatLng(places[i].geometry.location.lat, places[i].geometry.location.lng));
      }

      service.getDistanceMatrix(params, callback);

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
        } else {
          reject({ type: 'error', text: 'An error occurred.  Please try again.' });
          return;
        }
      }
    });
  };

  // reqDrivingDistance - Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
  app.controllers.reqDrivingDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
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
        } else {
          reject({ type: 'error', text: 'An error occurred.  Please try again.' });
          return;
        }
      }
    });
  };

  // reqTransitDistance - Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
  app.controllers.reqTransitDistance = function() {
    return new Promise(function(resolve, reject) {
      // Set params for search (use userLoc if available)
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat;
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng;
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
        } else {
          reject({ type: 'error', text: 'An error occurred.  Please try again.' });
          return;
        }
      }
    });
  };

})();
