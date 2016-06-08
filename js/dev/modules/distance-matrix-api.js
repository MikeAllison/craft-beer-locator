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
      var maxReqDests = 25; // Google's limit of destinations for a single Distance Maxtrix request
      var allResults = {};

      console.log('starting destinations: ' + destinations.length);

      while (destinations.length > 0) {
        params.destinations = [];
        console.log('inner destinations.length:' + destinations.length);
        var reqArray = destinations.splice(0, maxReqDests);
        console.dir(reqArray);
        for (var i=0; i < reqArray.length; i++) {
          params.destinations.push(new google.maps.LatLng(reqArray[i].lat, reqArray[i].lng));
        }
        console.dir(params);
        service.getDistanceMatrix(params, callback);
      }

      // var totalRequests = Math.ceil(destinations.length / maxReqDests);
      // console.log('destinations: ' + destinations.length);
      // console.log('totalRequests: ' + totalRequests);
      //
      // var start = 0;
      // var end = maxReqDests;
      //
      // for (var i=0; i < totalRequests; i++) {
      //   var reqArray = destinations.slice(start, end);
      //   console.dir(reqArray);
      //   start += totalRequests;
      //   end += totalRequests;
      // }

      // if (destinations.length < maxDestinations) {
      //   for (var i=0; i < destinations.length; i++) {
      //     params.destinations.push(new google.maps.LatLng(destinations[i].lat, destinations[i].lng));
      //   }
      //
      //   service.getDistanceMatrix(params, callback);
      // }

      // If destinations.length > maxRequests
      // Create a new temp array
      // Shift the first maxRequests onto temp array
      // Make request
      // Add results to allResults

      // Get new destinations.length
      // return if 0
      // If destinations.lenth > maxRequests
      // Create a new temp array
      // Shift the first maxRequests onto temp array
      // Make request
      // Add results to allResults

      function callback(results, status) {
        console.log(status);
        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject({ type: 'error', text: 'An error occurred. Please try again.' });
          return;
        }
        // Need to add new results to allResults object
        console.log('results');
        console.dir(results);
        allResults = results;
        console.log('allResults');
        console.dir(allResults);

        console.log('destinations.length: ' + destinations.length);
        if (destinations.length === 0) {
          console.log('resolve');
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
