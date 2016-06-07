// Code related to Google Maps Distance Matrix API

(function() {

  app.controllers = app.controllers || {};

  // reqMultiDistance - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  app.controllers.reqMultiDistance = function(lat, lng, destinations) {
    return new Promise(function(resolve, reject) {
      var lat = app.models.userLoc.lat || app.models.searchLoc.lat; // This
      var lng = app.models.userLoc.lng || app.models.searchLoc.lng; // This
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();

      var places = app.models.places.get(); // This

      // TO-DO: Take this out and test (sorting usually happens after this)
      // Flattens array if primary and secondary results have been determined previously
      if (places.primary || places.secondary) { // THIS...
        places = places.primary.concat(places.secondary);
      } // ...TO THIS

      for (var k=0; k < places.length; k++) { // THIS...
        params.destinations.push(new google.maps.LatLng(places[k].geometry.location.lat, places[k].geometry.location.lng));
      } // ...TO THIS

      service.getDistanceMatrix(params, callback);

      function callback(results, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

        for (var i=0; i < results.rows[0].elements.length; i++) { // THIS...
          // Guard against no driving options to destination
          if (results.rows[0].elements[0].distance) {
            // Add distance info to each result (value is distance in meters which is needed for sorting)
            places[i].drivingInfo = {
              value: results.rows[0].elements[i].distance.value,
              distance: results.rows[0].elements[i].distance.text,
              duration: results.rows[0].elements[i].duration.text
            };
          }
        } // ...TO THIS

        app.models.places.add(places); // This
        resolve(results);
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
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

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
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }

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
    });
  };

})();
