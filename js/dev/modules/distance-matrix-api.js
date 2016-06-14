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
      var maxDests = 25; // Google's limit of destinations for a single Distance Maxtrix request
      var reqCount = Math.ceil(destinations.length / maxDests);

      var allResults = {
        originAddresses: [],
        destinationAddresses: [],
        rows: [{ elements: [] }]
      };

      console.log('Total destinations: ' + destinations.length);
      console.log('Total requests: ' + reqCount);

      while (reqCount > 0) {
        var reqGroup = [];
        var latLngObjs = [];

        reqGroup = destinations.splice(0, maxDests);

        console.log('Request #: ' + reqCount);
        console.dir(reqGroup);

        reqGroup.forEach(function(destination) {
          latLngObjs.push(new google.maps.LatLng(destination.lat, destination.lng));
        });

        sendRequest(latLngObjs);

        reqCount--;
      }

      function sendRequest(latLngObjs) {
        var service = new google.maps.DistanceMatrixService();
        var params = {
          origins: [new google.maps.LatLng(lat, lng)], // lat, lng from getDistanceMatrix args
          destinations: latLngObjs,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        service.getDistanceMatrix(params, function(results, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject({ type: 'error', text: 'An error occurred. Please try again.' });
            return;
          }

          console.dir(results);
        });
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
