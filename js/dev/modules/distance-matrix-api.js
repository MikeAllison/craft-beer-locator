/*************************************************
  Code related to Google Maps Distance Matrix API
**************************************************/

(function() {

  app.controllers = app.controllers || {};

  /**************************************************************************************************************
    reqMultiDistance() - Requests distance (driving) from Google Maps Distance Matrix for a collection of places
  ***************************************************************************************************************/
  app.controllers.reqMultiDistance = function(lat, lng, destinations) {
    return new Promise(function(resolve, reject) {
      var params = {
        origins: [new google.maps.LatLng(lat, lng)],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      };
      var service = new google.maps.DistanceMatrixService();
      var maxDests = 25; // Google's limit of destinations for a single Distance Maxtrix request
      var allResults = {
        originAddresses: [],
        destinationAddresses: [],
        rows: [{ elements: [] }]
      };

      console.log('Total destinations: ' + destinations.length);

      if ((destinations.length > maxDests * 2) && (destinations.length <= maxDests * 3)) {
        console.log('50-75 called');
        params.destinations = [];
        var tempDests = [];

        tempDests = destinations.splice(0, maxDests);

        tempDests.forEach(function(destination) {
          params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
        });

        service.getDistanceMatrix(params, function(results, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          addResults(results);
          resolveResults();
        });
      }

      if ((destinations.length > maxDests) && (destinations.length <= maxDests * 2)) {
        console.log('25-50 called');
        params.destinations = [];
        var tempDests = [];

        tempDests = destinations.splice(0, maxDests);

        tempDests.forEach(function(destination) {
          params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
        });

        service.getDistanceMatrix(params, function(results, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          addResults(results);
          resolveResults();
        });
      }

      if (destinations.length <= maxDests) {
        console.log('<25 called');
        params.destinations = [];

        destinations.forEach(function(destination) {
          params.destinations.push(new google.maps.LatLng(destination.lat, destination.lng));
        });

        service.getDistanceMatrix(params, function(results, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          addResults(results);
          resolveResults();
        });
      }

      function addResults(results) {
        allResults.originAddresses = results.originAddresses;

        results.destinationAddresses.forEach(function(address) {
          allResults.destinationAddresses.push(address);
        });

        results.rows[0].elements.forEach(function(element) {
          allResults.rows[0].elements.push(element);
        });
      }

      function resolveResults() {
        if (allResults.rows[0].elements.length === destinations.length) {
          resolve(allResults);
        }
      }
    });
  };

  /************************************************************************************************************
    reqDrivingDistance() - Requests driving distance from Google Maps Distance Matrix for models.selectedPlace
  *************************************************************************************************************/
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

  /***********************************************************************************************************
    reqTransitDistance() - Requests subway distance from Google Maps Distance Matrix for models.selectedPlace
  ************************************************************************************************************/
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
